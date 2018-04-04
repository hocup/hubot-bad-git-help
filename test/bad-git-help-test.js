/* eslint-env node, mocha */

const Helper = require('hubot-test-helper');
const chai = require('chai');

const expect = chai.expect;

const helper = new Helper('../src/bad-git-help.js');

describe('bad-git-help', function(){
    beforeEach(function() {
        this.room = helper.createRoom();
    });

    afterEach(function() {
        this.room.destroy();
    });

    const testPhrases = [
        "How do I <do something> with git?",
        "How can I <do something> with git?",
        "How would I <do something> with git?",
        "how would you <do something> in git",
        "What is the git command to <do something>?",
        "what is a git command to <do something>",
        "What's a git command to <do something>?",
        "anyone know a git command to <do something>?",
        "how to <do something> in git?",
        "How do you <do something> in git?",
        "how does git <do something> work?",
        "how does the git-<do something> command work?",
        "How do i use git <do something>?"
    ];

    const testSomethings = [
        "pull stuff from a remote",
        "trim trees",
        "create all sorts of exciting things",
        "undo",
        "cherry pick"
    ];

    testPhrases.forEach(function(phrase) {
        let action = testSomethings[Math.floor(Math.random()*testSomethings.length)];
        let specificPhrase = phrase.replace("<do something>", action);

        it('should react appropriately to messages of form "' + specificPhrase + '"', function() {
            let actionKebab = "git-" + action.replace(/\s/g, "-");

            let room = this.room;
            return this.room.user.say('alice', specificPhrase)
            .then(
                () => {
                    // Delay the actual test, so the http request has a chance to finish
                    return new Promise (
                        (resolve) => {
                            setTimeout(() => {resolve();}, 350);
                        }
                    );
                }
            )
            .then(
                function () {
                    expect(room.messages).to.have.lengthOf(2);
                    expect(room.messages[1]).to.have.lengthOf(2);
                    expect(room.messages[1][1]).to.have.string(actionKebab);
                }
            );
        });
    });
    
});