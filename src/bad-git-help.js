// Description
//   A hubot script that pretends to know a lot about git.
//
// Commands:
//   how do I <do something> in git? - Either retrieves the git help for <do something> or makes something up. Never admits defeat.
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   Gennady Malyshev <gmalyshev@akitabox.com>

let gitGrammar = require('baba-grammar-git-man-page-generator');
let cheerio = require('cheerio');

module.exports = (robot) => {
    let triggers = [
        new RegExp("How\\s+(?:do|can|would|)\\s*(?:I|you)\\s+(.*)\\s+(?:in|with|to)\\s+git", "i"),
        new RegExp("(?:What\\s+is|what's|anyone\\s+know)\\s+(?:the|a)\\s+git\\s+command\\s+to\\s+(.*[^\\?])", "i"),
        new RegExp("How\\s+to\\s+(.*)\\s+in\\s+git", "i"),
        new RegExp("(?:How|what)\\s+(?:does|is)\\s+(?:the\\s+)*git(?:\\s|-)(.*)\\s+(?:work|do)", "i"),
        new RegExp("How\\s+(?:do|can)\\s+I\\s+use\\s+git(?:\\s|-)(.*[^\\?])", "i")
    ];

    triggers.forEach(
        (trigger) => {
            robot.hear(trigger, matchedCallback);
        }
    );
}

function matchedCallback(res) {
    getGitHelp(res).then(
        (helpObj) => {
            let response = helpObj.commandName + "\n";
            response += "*SYNOPSIS*: " + helpObj.synopsis + "\n";
            response += "*DESCRIPTION*: \n" + helpObj.description + "\n";
            if(helpObj.link) {
                response += helpObj.link;
            }

            // Some formatting replacements. Specific to slack.
            response = response.replace(/<code>|<\/code>/g, "`");
            response = response.replace(/<i>|<\/i>/g, "`");
            response = response.replace(/<em>|<\/em>/g, "_");
            response = response.replace(/<strong>|<\/strong>/g, "*");
            response = response.replace(/&quot;/g, "\"")
            response = response.replace(/<a href="(.*)">(.*)<\/a>/g, "$2 (https://git-scm.com/$1)");

            res.reply(response);
        }
    ).catch(
        () => {
            // Do nothing with caught errors
        }
    );
}

function getGitHelp(res) {
    
    return new Promise((resolve) => {
        let commandName = "git-" + makeKebobCase(res.match[1]);

        // See if a real help file is available
        let helpUrl = "https://git-scm.com/docs/" + commandName; 

        res.http(helpUrl).timeout(250).get()(
            (err, getResult, body) => {
                if(err || getResult.statusCode != 200) {
                    // git-scm.com will redirect if no help file found
                    resolve(getGitNonsense(commandName.replace(/s$/i, "")));
                } else {
                    let $ = cheerio.load(body);

                    let commandNameLine = $('#_name').next('.sectionbody').text();
                    let synopsis = $('#_synopsis').next('.sectionbody').text().replace(/^(git \S*)/gm, "<em>$1</em>");
                    let description = $('#_description').next('.sectionbody').find('div').first().children().first().html();

                    resolve({
                        commandName: commandNameLine,
                        synopsis: synopsis,
                        description: description,
                        link: helpUrl
                    });
                }
            }
        );
    });
}

function getGitNonsense(commandName) {
    // Generate some junk!
    return new Promise(
        (resolve) => {

            // Approximate what the verbs and the nouns are
            // The verb is probably the first word, and the noun is everything else in the command
            let commandSplit = commandName.split("-");
            
            let verb = commandSplit[1];
            let noun = commandSplit.splice(2).join(" ");

            let commandObj = {
                "command-verb": verb,
                "command-noun": noun
            };

            // Command Name Line
            let commandNameLine = "\n\n" + commandName + " - " + capitilizeFirstChar(gitGrammar.default["command-action"](commandObj)) + "\n";

            // Synopsis
            const numLines = Math.floor(Math.random()*3) + 1;

            let options = [];

            for(let i = 0 ; i < numLines; i++) {
                const numPerLine = Math.floor(Math.random()*3) + 1;
                let line = "";
                for(let j = 0; j < numPerLine; j++) {
                    line += (j == 0 ? "" : " ") + generateOptionChunk(commandObj);
                }

                options.push(line);
            }

            let sJoiner = "\n<em>" + commandName + "</em> ";
            let synopsis = "\n" + sJoiner + options.join(sJoiner) + "\n";

            // Command Description
            let desc = commandName + " " + gitGrammar.default["command-description"](commandObj) + " " + gitGrammar.default.sentence(commandObj);
            if(Math.random() > 0.3) {
                desc += " " + gitGrammar.default.sentence(commandObj);
            }

            // Sometimes the noun has spaces in it. That's fine when it is used as a noun,
            // but needs fixing when used as part of the command name
            desc = desc.replace("git-" + verb + "-" + noun, "git-" + verb + "-" + makeKebobCase(noun));

            resolve({
                commandName: commandNameLine,
                synopsis: synopsis,
                description: wrapString(desc,70,"\n", ["<code>", "</code>", "<em>", "</em>"]),
                link: null
            });
        }
    );
}

function generateOptionChunk(commandObj) {
    let out = [
        gitGrammar.default["command-option-raw"](commandObj)
    ];

    let numOptions = Math.floor(Math.random()*3);
    for(let i = 0; i < numOptions; i++) {
        out.push(gitGrammar.default["command-option-raw"](commandObj));
    }

    if(out.length == 1 && Math.random() > 0.4) {
        return out[0];
    } else {
        return "[ " + out.join(" | ") + " ]";
    }
}

function makeKebobCase(s) {
    return s.toLowerCase().replace(/\s+/g, "-")
}

function capitilizeFirstChar(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function wrapString(s, len, joiner = "\n", ignoreTags = []) {
    let splitString = s.split(/\s+/);
    let wrappedString = [];
    for(let i = 0; i < splitString.length; i++) {
        let currentLine = wrappedString.length - 1;
        let currentLineLength = 0;
        if(wrappedString.length > 0) {
            let trialLine = wrappedString[currentLine] + " " + splitString[i];

            // Use this to split off formatting tags that won't show up in the end
            ignoreTags.forEach(
                (t) => {
                    trialLine = trialLine.replace(t, "");
                }
            );
            currentLineLength = trialLine.length;
        }

        if(!wrappedString[currentLine] || currentLineLength > len) {
            wrappedString[currentLine+1] = splitString[i];
        } else {
            wrappedString[currentLine] += " " + splitString[i];
        }
    }

    if(joiner) {
        return wrappedString.join(joiner);
    } else {
        return wrappedString;
    }
}