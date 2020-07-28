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
    this.voteHistory = [];
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
    this.members = [];
  }

  /**
   * Decides what the party line for a bill is
   * Party decisions are deterministic
   * @param {String}  billIssue   the issue the bill addreses
   * @param {Point}   billCompass the compass of the bill
   */
  decide(billIssue, billCompass) {
    if (!this.issues.includes(billIssue)) return "ABSTAIN";
    if (this.compass.distanceTo(billCompass) > 7.5) {
      return "AYE";
    } else {
      return "NAY";
    }
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
  }

  /**
   * Decides how the legislator will vote on a bill
   * @param {String}  billIssue   the issue the bill addresses
   * @param {Point}   billCompass the compass of the bill
   * @returns the legislator's decision
   */
  decide(billIssue, billCompass) {
    if (!this.issues.includes(billIssue)) return this.party.decide(billIssue, billCompass);
    if (this.compass.distanceTo(billCompass) > 5 + (Math.random() * 5)) {
      return "NAY";
    } else {
      return "AYE";
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

    this.laws = [];
    this.sessions = 0;
    this.failed = () => this.sessions - this.laws.length;
    this.percentPassed = () => this.sessions ? (this.laws.length / this.sessions) * 100 : 0;
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
        names[i % names.length],
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
      let legislator = new Legislator(names[i % names.length], party, compass, myIssues);
      legislators.push(legislator);
      party.members.push(legislator);
    }
    return legislators;
  }

  /**
   * Hold a legislature session where someone random sponsors a bill and everyone votes
   * @returns an object representing the bill's fate
   */
  holdSession() {
    this.sessions++;
    let name = this.generateBillName();
    let sponsor = randomSelect(this.legislators);
    let issue = randomSelect(sponsor.issues);
    let compass = sponsor.compass.add(randomCompass(5));
    sponsor.billsIntroduced.push(name);
    this.parties.forEach(party => party.voteHistory.push(name + " - " + party.decide(issue, compass)));

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
    if (passed) this.laws.push(name);
    return {
      name: name,
      sponsor: sponsor,
      issue: issue,
      compass: compass,
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

/**
 * GLOBAL VARIABLES FOR THE VIEW
 */
let viewingLegislator;
let viewingParty;

window.addEventListener("load", init);

function init() {
  $("#intro-modal").modal("show");
  document.getElementById("options").addEventListener("submit", event => {
    electLegislature(event);
    // the rest shows the placholders again. Doesn't work inside electLegislature for some reason
    document.getElementById("party-placeholder").classList.remove("d-none");
    document.getElementById("party-details").classList.add("d-none");
    document.getElementById("legislator-placeholder").classList.remove("d-none");
    document.getElementById("legislator-details").classList.add("d-none");
  });
}

/**
 * Elect a new legislature and allow sessions to start
 * @param {Event} event event that triggered when options were sumbitted
 */
function electLegislature(event) {
  event.preventDefault();
  $("#intro-modal").modal("hide");
  let form = document.getElementById("options");
  let options = new FormData(form);
  let currentLegislature = new Legislature(
    options.get("legislatornames") ? options.get("legislatornames").split("\n") : names,
    options.get("partynames") ? options.get("partynames").split("\n") : nouns.map(noun => titleCase(noun + " Party")),
    ["red", "green", "blue", "orange", "purple"],
    options.get("issuenames") ? options.get("issuenames").split("\n") : shuffle(nouns).slice(0, options.get("issues")),
    parseInt(options.get("size")),
    parseInt(options.get("parties")),
    parseInt(options.get("issues"))
  );
  viewingLegislator = null;
  viewingParty = null;
  document.getElementById("current-bill").textContent = "No bills introduced yet";
  ["aye", "nay", "abstain"].forEach(id => document.getElementById(id).textContent = "?");

  updateSidebar(currentLegislature);
  updateChart(currentLegislature);
  
  let nextBtn = document.getElementById("next");
  nextBtn.onclick = async function(){
    nextBtn.setAttribute("disabled", true);
    await showVotes(currentLegislature, currentLegislature.holdSession());
    updateSidebar(currentLegislature);
    nextBtn.removeAttribute("disabled");
  };
}

/**
 * Update sidebar details
 * @param {Legislature} legislature the legislature to show the info of
 */
function updateSidebar(legislature) {
  if (viewingLegislator) updateLegislatorInfo(viewingLegislator);
  if (viewingParty) updatePartyInfo(viewingParty);

  let partyMemberCount = legislature.parties.map(party => {
    let span = document.createElement("span");
    span.append(partyLink(party), ": ", party.members.length);
    return span;
  })
  populateTextList(document.getElementById("legislature-parties"), partyMemberCount);
  populateTextList(document.getElementById("legislature-laws"), legislature.laws);

  document.getElementById("legislature-sessions").textContent = legislature.sessions;
  document.getElementById("legislature-passed").textContent = legislature.laws.length;
  document.getElementById("legislature-passpercent").textContent = round(legislature.percentPassed()) + "%";
  document.getElementById("legislature-failed").textContent = legislature.failed();
}

/**
 * Show the results of voting on a bill
 * @param {Object} legislature the legislature that voted
 * @param {Object} voteResults the results of a bill
 */
async function showVotes(legislature, voteResults) {
  document.getElementById("party-list").classList.add("d-none");
  let {name, sponsor, issue, compass, passed, aye, nay, abstain, votes} = voteResults;
  document.getElementById("current-bill").textContent = name;

  log(legislatorLink(sponsor), ` is introducing the ${name}, which is about the following topic: ${issue}`);
  let partyLineList = document.createElement("ul");
  for (let party of legislature.parties) {
    let partyLine = document.createElement("li");
    partyLine.append(partyLink(party), ": ", voteSpan(party.decide(issue, compass)));
    partyLineList.append(partyLine);
  }
  log("Party lines for this bill:", partyLineList);

  let chart = document.getElementById("chart");
  chart.innerHTML = "";
  Object.values(tallies).forEach(elem => elem.innerHTML = 0);
  let squareAnimation = [];
  for (let i = 0; i < legislature.legislators.length; i++) {
    let legislator = legislature.legislators[i];
    let vote = votes.get(legislator);
    let square = chartSquare(colors[vote], legislator, legislature.size);
    squareAnimation.push(
      new Promise(resolve => setTimeout(() => {
        tallies[vote].textContent = parseInt(tallies[vote].textContent) + 1;
        chart.appendChild(square);
        resolve();
      }, i*10)));
  }
  await Promise.all(squareAnimation);
  log(`The ${name} `,
    coloredSpan(passed ? "PASSED" : "FAILED", passed ? "green" : "red"),
    ` with `,
    coloredSpan(aye, "green"), " AYE ",
    coloredSpan(nay, "red"), " NAY ",
    `and ${abstain} abstaining.`);
}

/**
 * Updates the legislature chart with the legislature info
 * @param {Legislature} legislature the legislature to take info from
 */
function updateChart(legislature) {
  let chart = document.getElementById("chart");
  chart.innerHTML = "";
  for (let legislator of legislature.legislators) {
    chart.appendChild(chartSquare(legislator.party.color, legislator, legislature.size));
  }

  let partyList = document.getElementById("party-list");
  partyList.classList.remove("d-none");
  partyList.innerHTML = "";
  legislature.parties.forEach(party => partyList.append(partyLink(party)));
}

/**
 * Creates a chart square for a legislator
 * @param {String}      color       color of the square
 * @param {Legislator}  legislator  legislator whose info to show when clicked/hovered
 * @param {Number}      members     number of members in legislature
 * @returns {HTMLDivElement} legislator's chart square
 */
function chartSquare(color, legislator, members) {
  let square = document.createElement("div");
  setPopover(square, legislator);
  square.classList.add("chart-square");
  square.style.backgroundColor = color;
  let sideLength = (members >= 300) ? "1.5rem" : "2rem";
  square.style.width = sideLength;
  square.style.height = sideLength;
  square.addEventListener("click", () => jumpToLegislatorView(legislator));
  return square;
}

/**
 * Shows the legislator details tab in the sidebar and updates variables accordingly
 * Will also update the party tab with the legislator's party, but not switch to it
 * @param {Legislator} legislator legislator to show
 */
function jumpToLegislatorView(legislator) {
  viewingLegislator = legislator;
  updateLegislatorInfo(legislator);
  updatePartyInfo(legislator.party);
  $('a[href="#legislator-view"]').tab("show");
}

/**
 * Shows the party details tab in the sidebar and updates variables accordingly
 * @param {Party} party party to show
 */
function jumpToPartyView(party) {
  viewingParty = party;
  updatePartyInfo(party);
  $('a[href="#party-view"]').tab("show");
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
 * Updates the legislator's info in the sidebar
 * Also updates the party tab with the legislator's party info
 * @param {Legislator} legislator legislator to show info about
 */
function updateLegislatorInfo(legislator) {
  document.getElementById("legislator-placeholder").classList.add("d-none");
  document.getElementById("legislator-details").classList.remove("d-none");

  document.getElementById("legislator-name").textContent = legislator.name;
  let party = partyLink(legislator.party);
  party.id = "legislator-party";
  document.getElementById("legislator-party").replaceWith(party);
  document.getElementById("legislator-x").textContent = round(legislator.compass.x);
  document.getElementById("legislator-y").textContent = round(legislator.compass.y);
  populateTextList(document.getElementById("legislator-issues"), legislator.issues);
  populateTextList(document.getElementById("bills-introduced"), legislator.billsIntroduced);
  populateTextList(document.getElementById("vote-history"), legislator.voteHistory);
}

/**
 * Updates the party's info in the sidebar
 * @param {Party} party party to show info about
 */
function updatePartyInfo(party) {
  document.getElementById("party-placeholder").classList.add("d-none");
  document.getElementById("party-details").classList.remove("d-none");

  document.getElementById("party-name").textContent = party.name;
  document.getElementById("party-name").style.color = party.color;
  document.getElementById("party-x").textContent = round(party.compass.x);
  document.getElementById("party-y").textContent = round(party.compass.y);
  populateTextList(document.getElementById("party-issues"), party.issues);
  populateTextList(document.getElementById("party-lines"), party.voteHistory);
}

/**
 * Add a list of text as items in an HTML element
 * @param {HTMLElement}             list HTML list to add list items to
 * @param {(String|HTMLElement)[]}  text text that will be added under 1 list item in the list
 */
function populateTextList(list, text) {
  list.innerHTML = "";
  for (let element of text) {
    let listItem = document.createElement("li");
    listItem.append(element);
    list.appendChild(listItem);
  }
}

/**
 * Logs text in the log sidebar
 * @param {...(String|HTMLElement)} text text to log
 */
function log(...text) {
  let entry = document.createElement("li");
  entry.append(...text);
  document.getElementById("log").appendChild(entry);
  document.getElementById("next").scrollIntoView({behavior: "smooth"});
}

/**
 * Makes a colored span with text
 * @param {String} text   text to add
 * @param {String} color  CSS color
 * @return {HTMLSpanElement} a colored span with text
 */
function coloredSpan(text, color) {
  let span = document.createElement("span");
  span.style.color = color;
  span.textContent = text;
  return span;
}

/**
 * Makes a span appropriately colored for a vote
 * @param {String} vote A vote. Can be "AYE", "NAY", or "ABSTAIN"
 * @returns {HTMLSpanElement} a span appropriately colored for a vote
 */
function voteSpan(vote) {
  return coloredSpan(vote, colors[vote]);
}

/**
 * Makes a link that shows the legislator's details in the sidebar
 * @param {Legislator} legislator legislator to make a link for
 * @return {HTMLAnchorElement} a link that shows the legislator's details
 */
function legislatorLink(legislator) {
  let party = legislator.party;
  let link = document.createElement("a");
  link.href = "#";
  link.append(legislator.name, " (", coloredSpan(party.name, party.color), ")");
  link.addEventListener("click", () => {
    updateLegislatorInfo(legislator);
    $('a[href="#legislator-view"]').tab("show");
  });
  return link;
}

/**
 * Makes a link that shows the party's details in the sidebar
 * @param {Party} party         party to make a link for
 * @return {HTMLAnchorElement}  a link that shows the party's details
 */
function partyLink(party) {
  let link = document.createElement("a");
  link.href = "#";
  link.append(coloredSpan(party.name, party.color));
  link.addEventListener("click", () => jumpToPartyView(party));
  return link;
}