import adjectives from "./adjectives.mjs";
import verbs from "./verbs.mjs";
import nouns from "./nouns.mjs";
import names from "./names.mjs";

"use strict";
const colors = {
  "AYE": "green",
  "NAY": "red",
  "ABSTAIN": "gray"
};
const tallies = {
  "AYE": document.getElementById("aye"),
  "NAY": document.getElementById("nay"),
  "ABSTAIN": document.getElementById("abstain")
}

/**
 * UTILITY FUNCTIONS
 */

  /**
  * Randomly shuffles an array
  * Originally from https://stackoverflow.com/a/2450976
  * @param {Array} array array to shuffle
  * @reutns shuffled array
  */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/**
 * Randomly select an element from an array
 * Does not affect the original array
 * @param {Array} array array to select from
 * @returns randomly selected array element
 */
function randomSelect(array) {
  let index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Generates a random political compass point where each axis can be between -distance and
 * distance.
 * @param distance max distance on ONE axis the point can be generated to
 * @returns random political compass point
 */
function randomCompass(distance) {
  return new Point(
    Math.random() * distance * 2 - distance,
    Math.random() * distance * 2 - distance
    );
}

/**
 * Round a number to 2 decimal places
 * @param {Number} number to round
 * @returns rounded number
 */
function round(num) {
  return Math.round(num * 100) / 100
}

/**
 * Makes a string title cased
 * Originally from https://stackoverflow.com/a/11934819
 * @param {String} s string to make title case
 */
function titleCase(s){
  return s.replace(/([^\s:\-])([^\s:\-]*)/g,function($0,$1,$2){
      return $1.toUpperCase()+$2.toLowerCase();
  });
}

/**
 * Represents a point on a political compass
 */
class Point {
  /**
   * Creates a new point
   * @param {Number} x x coordinate
   * @param {Number} y y coordinate
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Get result of vector adding this point to another point
   * Value on each axis cannot go below -10 or above 10
   * @param {Point} point 
   */
  add(point) {
    let x = this.x + point.x; // I suspect there's a cleaner way to do this...
    if (x < -10) {
      x = -10;
    } else if (x > 10) {
      x = 10;
    } 
    let y = this.y + point.y;
    if (y < -10) {
      y = -10;
    } else if (y > 10) {
      y = 10;
    } 
    return new Point(x, y);
  }

  /**
   * Get the distance of this point to another point
   * @param {Point} point the point to find the distance to
   * @returns the distance of this point to the provided point
   */
  distanceTo(point) {
    let x1 = this.x;
    let y1 = this.y;
    let x2 = point.x;
    let y2 = point.y;
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}

/**
 * "Abstract" superclass of Party and Legislator, which both have names, compass, and issues
 */
class PoliticalActor {
  /**
   * Creates a new PoliticalActor
   * @param {String}  name    name
   * @param {Point}   compass political compass
   * @param {Array}   issues  issues this actor identifies with
   */
  constructor(name, compass, issues) {
    this.name = name;
    this.compass = compass;
    this.issues = [...new Set(issues)]; // removes dupes
  }
} 

/**
 * Represents a political party
 */
class Party extends PoliticalActor {
  /**
   * Creates a new party
   * @param {String}  name    party name
   * @param {String}  color   display color
   * @param {Point}   compass political compass
   * @param {Array}   issues  issues this party identifies with
   */
  constructor(name, color, compass, issues) {
    super(name, compass, issues);
    this.color = color;
  }
}

/**
 * Represents a legislator
 */
class Legislator extends PoliticalActor {
  /**
   * Creates a new legislator
   * @param {String}  name    legislator name
   * @param {Party}   party   party this legislator is a member of
   * @param {Point}   compass political compass
   * @param {Array}   issues  issues this legislator identifies with
   */
  constructor(name, party, compass, issues) {
    super(name, compass, issues);
    this.party = party;
    this.billsIntroduced = [];
    this.voteHistory = [];
  }

  /**
   * Decides how the legislator will vote on a bill
   * @param {String}  billIssue   the issue the bill addresses
   * @param {Point}   billCompass the compass of the bill
   * @returns the legislator's decision
   */
  decide(billIssue, billCompass) {
    if (!this.issues.includes(billIssue)) {
      return "ABSTAIN";
    } else {
      if (this.compass.distanceTo(billCompass) > 5 + (Math.random() * 5)) {
        return "NAY";
      } else {
        return "AYE";
      }
    }
  }
}

/**
 * Represents a legislature along with its legislators and parties
 */
class Legislature {
  /**
   * Creates a new legislature
   * @param {Array}   legislatorNames all legislator names possible to choose from
   * @param {Array}   partyNames      all party names possible to choose from
   * @param {Array}   colors          all party colors possible to choose from
   * @param {Array}   issues          all issues possible to identify with
   * @param {Number}  size            number of legislators in the legislature
   * @param {Number}  numParties      number of parties in the legislature
   * @param {Number}  issueSelections number of times a legislator/party should select issues
   */
  constructor(legislatorNames, partyNames, colors, issues, size, numParties, issueSelections) {
    legislatorNames = shuffle(legislatorNames);
    partyNames = shuffle(partyNames);
    colors = shuffle(colors);
    this.size = size;
    this.issues = issues;
    this.issueSelections = issueSelections;
    this.parties = this.generateParties(partyNames, colors, numParties);
    this.legislators = this.generateLegislators(legislatorNames, size, issueSelections);
    log(`Created a legislature with ${size} members and ${numParties} available parties to join.`);
  }

  /**
   * Randomly generates new parties
   * @param {Array}   names       all party names possible to choose from
   * @param {Array}   colors      all party colors possible to choose from
   * @param {Number}  numParties  number of parties in the legislature
   * @return {Array} a list of parties in this legislature
   */
  generateParties(names, colors, numParties) {
    let parties = [];
    for (let i = 0; i < numParties; i++) {
      let partyIssues = [];
      for (let issueNo = 0; issueNo < this.issueSelections; issueNo++) {
        partyIssues.push(randomSelect(this.issues));
      }
      parties.push(new Party(
        titleCase(names[i % names.length] + " Party"),
        colors[i % colors.length],
        randomCompass(10),
        partyIssues
        ));
    }
    return parties;
  }

  /**
   * Randomly generates new legislators and assigns them to parties
   * @param {Array}   names           all legislator names possible to choose from
   * @param {Number}  numLegislators  number of legislators in the legislature
   * @return {Array} a list of legislators in this legislature
   */
  generateLegislators(names, numLegislators) {
    let legislators = [];
    for (let i = 0; i < numLegislators; i++) {
      let compass = randomCompass(10);
      let party = this.parties.reduce( (party1, party2) => { // choose party with closest compass
        return compass.distanceTo(party1.compass) < compass.distanceTo(party2.compass) ? party1 : party2;
      });
      let myIssues = [];
      for (let issueNo = 0; issueNo < this.issueSelections; issueNo++) {
        myIssues.push(randomSelect(this.issues));
      }
      myIssues = myIssues.concat(party.issues);
      legislators.push(new Legislator(names[i % names.length], party, compass, myIssues));
    }
    return legislators;
  }

  /**
   * Hold a legislature session where someone random sponsors a bill and everyone votes
   * @returns an object representing the bill's fate
   */
  holdSession() {
    let name = this.generateBillName();
    let sponsor = randomSelect(this.legislators);
    let issue = randomSelect(sponsor.issues);
    let compass = sponsor.compass.add(randomCompass(5));
    sponsor.billsIntroduced.push(name);

    let votes = new Map();
    let notAbstain = 0;
    let aye = 0;
    let nay = 0;
    for (let legislator of this.legislators) {
      let vote = legislator === sponsor ? "AYE" : legislator.decide(issue, compass);
      votes.set(legislator, vote);
      if (vote !== "ABSTAIN") notAbstain++;
      if (vote === "AYE") aye++;
      if (vote === "NAY") nay++;
      legislator.voteHistory.push(name + " - " + vote);
    }
    let passed = aye / notAbstain > 0.5;
    return {
      name: name,
      sponsor: sponsor,
      issue: issue,
      passed: passed,
      aye: aye,
      nay: nay,
      abstain: this.size - notAbstain,
      votes: votes,
    }
  }

  /**
   * Generates a random bill name with the format ADJECTIVE NOUN VERB Act
   * @returns a random bill name
   */
  generateBillName() {
    return titleCase(`${randomSelect(adjectives)} ${randomSelect(nouns)} ${randomSelect(verbs)} Act`);
  }
}

window.addEventListener("load", init);

async function init() {
  let currentLegislature = new Legislature(
    names,
    nouns,
    ["red", "green", "blue", "orange", "purple"],
    shuffle(nouns).slice(0,5),
    30,
    5,
    5
  );
  updateChart(currentLegislature);

  let nextBtn = document.getElementById("next");
  nextBtn.addEventListener("click", async function(){
    nextBtn.setAttribute("disabled", true);
    await showVotes(currentLegislature, currentLegislature.holdSession());
    nextBtn.removeAttribute("disabled");
  })
}

/**
 * Show the results of voting on a bill
 * @param {Object} legislature the legislature that voted
 * @param {Object} voteResults the results of a bill
 */
async function showVotes(legislature, voteResults) {
  let {name, sponsor, issue, passed, aye, nay, abstain, votes} = voteResults;
  document.getElementById("current-bill").textContent = name;
  log(`${sponsor.name} (${sponsor.party.name}) is introducing the ${name}, which is about the following topic: ${issue}`);
  let chart = document.getElementById("chart");
  chart.innerHTML = "";
  Object.values(tallies).forEach(elem => elem.innerHTML = 0);
  let squareAnimation = [];
  for (let i = 0; i < legislature.legislators.length; i++) {
    let legislator = legislature.legislators[i];
    let vote = votes.get(legislator);
    let square = document.createElement("div");
    setPopover(square, legislator);
    square.classList.add("chart-square");
    square.style.backgroundColor = colors[vote];
    square.addEventListener("click", () => showLegislatorInfo(legislator));
    squareAnimation.push(
      new Promise(resolve => setTimeout(() => {
        tallies[vote].textContent = parseInt(tallies[vote].textContent) + 1;
        chart.appendChild(square);
        resolve();
      }, i*50)));
  }
  await Promise.all(squareAnimation);
  log(`The ${name} ${passed ? "PASSED" : "FAILED"} with ${aye} AYE, ${nay} NAY, and ${abstain} abstaining.`);
}

/**
 * Updates the legislature chart with the legislature info
 * @param {Legislature} legislature the legislature to take info from
 */
function updateChart(legislature) {
  let chart = document.getElementById("chart");
  chart.innerHTML = "";
  for (let legislator of legislature.legislators) {
    let square = document.createElement("div");
    setPopover(square, legislator);
    square.classList.add("chart-square");
    square.style.backgroundColor = legislator.party.color;
    square.addEventListener("click", () => showLegislatorInfo(legislator));
    chart.appendChild(square);
  }
}

/**
 * Sets a popover for a legislator's chart square
 * @param {HTMLElement} square      the square to add a popover to
 * @param {Legislator}  legislator  the legislator whose info to show
 */
function setPopover(square, legislator) {
  let content = document.createElement("div");

  let party = document.createElement("p");
  party.textContent = legislator.party.name;
  party.style.color = legislator.party.color;

  let compass = document.createElement("p");
  compass.textContent = `Economic: ${round(legislator.compass.x)} Social: ${round(legislator.compass.y)}`;

  let issueTitle = document.createTextNode("Cares about:");
  let issues = document.createElement("ul");
  populateTextList(issues, legislator.issues);

  [party, compass, issueTitle, issues].forEach(elem => content.append(elem));

  $(square).popover({
    title: legislator.name,
    content: content,
    html: true,
    placement: "bottom",
    trigger: "hover"
  });
}

/**
 * Shows the legislator's info in the sidebar
 * Also updates the party tab with the legislator's party info
 * @param {Legislator} legislator legislator to show info about
 */
function showLegislatorInfo(legislator) {
  document.getElementById("legislator-name").textContent = legislator.name;
  document.getElementById("legislator-party").textContent = legislator.party.name;
  document.getElementById("legislator-party").style.color = legislator.party.color;
  document.getElementById("legislator-x").textContent = round(legislator.compass.x);
  document.getElementById("legislator-y").textContent = round(legislator.compass.y);
  populateTextList(document.getElementById("legislator-issues"), legislator.issues);
  populateTextList(document.getElementById("bills-introduced"), legislator.billsIntroduced);
  populateTextList(document.getElementById("vote-history"), legislator.voteHistory);
  
  showPartyInfo(legislator.party);
}

/**
 * Shows the party's info in the sidebar
 * @param {Party} party party to show info about
 */
function showPartyInfo(party) {
  document.getElementById("party-name").textContent = party.name;
  document.getElementById("party-name").style.color = party.color;
  document.getElementById("party-x").textContent = round(party.compass.x);
  document.getElementById("party-y").textContent = round(party.compass.y);
  populateTextList(document.getElementById("party-issues"), party.issues);
}

/**
 * Add a list of text as items in an HTML element
 * @param {HTMLElement} list HTML list to add list items to
 * @param {Array}       text list of text to add as items to the HTML list
 */
function populateTextList(list, text) {
  list.innerHTML = "";
  for (let string of text) {
    let listItem = document.createElement("li");
    listItem.textContent = string;
    list.appendChild(listItem);
  }
}

/**
 * Logs text in the log sidebar
 * @param {String} text text to log
 */
function log(text) {
  let entry = document.createElement("li");
  entry.textContent = text;
  document.getElementById("log").appendChild(entry);
  document.getElementById("next").scrollIntoView({behavior: "smooth"});
}