/* eslint-disable no-console */

import Vue from 'vue'
import Vuex from 'vuex'
import auth from 'solid-auth-client'
import $rdf from 'rdflib'
import * as fileClient from 'solid-file-client'

import data from '@solid/query-ldflex'
import 'setimmediate'

// var ACL = $rdf.Namespace("http://www.w3.org/ns/auth/acl#")
const DBPEDIA = $rdf.Namespace("http://dbpedia.org/resource/")
const DC = $rdf.Namespace("http://purl.org/dc/terms/")
const ESSGLOBAL = $rdf.Namespace("http://purl.org/essglobal/vocab/v1.1/")
//var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/")
// var GREG = $rdf.Namespace("http://www.w3.org/ns/time/gregorian/")
const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#")
const POSIX = $rdf.Namespace("http://www.w3.org/ns/posix/stat#")
const QUDT = $rdf.Namespace("http://qudt.org/schema/qudt/")
const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
const RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#")
const SCHEMA = $rdf.Namespace("http://schema.org/")
const SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#")
const TIME = $rdf.Namespace("http://www.w3.org/2006/time#")
//var VF = $rdf.Namespace("https://w3id.org/valueflows#")
const VCARD = $rdf.Namespace("http://www.w3.org/2006/vcard/ns#")
const VFBT = $rdf.Namespace("https://lab.allmende.io/solidbase/valueflows/raw/plan/release-doc-in-process/budget.ttl#");
const XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#")


const mimeType = 'text/turtle'

const PUBLIC_SUBFOLDER = process.env.VUE_APP_PUBLIC_SUBFOLDER
const PRIVATE_SUBFOLDER = process.env.VUE_APP_PRIVATE_SUBFOLDER
const BASEID = process.env.VUE_APP_BASEID

Vue.use(Vuex)

function newBlankNode(state) {
  var node
  do {
    node = new $rdf.BlankNode()
    console.log('get new blanknode ID: ' + node);
  } while (state.graph.statementsMatching(node).length != 0) // here seems to be a inconsistency in blanknode creation        return node
  return node
}

function solidFetch({state, url}) {
  if (state.ro) {
    return fetch(url)
  } else {
    return auth.fetch(url)
  }
}

export default new Vuex.Store({
  state: {
    webId: "",
    name: "",
    loggedIn: false,
    graph: $rdf.graph(),
    eClassGraph: $rdf.graph(),
    eClassGraphAdmin: $rdf.graph(),
    ldRessource: null,
    budgetList: [],
    session: null,
    processClasses: ['SSEInitiative', 'business branch', 'production procedure'],
    admin: false,
    admins: null,
    locales: ['cs', 'de', 'en', 'fr', 'hu'],
    locale: 'en', // of budget
    ro: false,
    examples: [],
    currencies: [{
            iso: 'Euro',
            abbr: '€',
            name: DBPEDIA('Euro'),
            locales: ['de', 'fr']
          }, {
            iso: 'HUF',
            abbr: 'Ft',
            name: DBPEDIA('Hungarian_forint'),
            locales: ['hu']
          }, {
            iso: 'CZK',
            abbr: 'Kč',
            name: DBPEDIA('Czech_koruna'),
            locales: ['cs']
          }, {
            iso: 'Dollar',
            abbr: '$',
            name: DBPEDIA('United_States_dollar'),
            locales: ['en']
          }],
    decimals: false,
    ldflex: true
  },
  getters: {
    // returns true if budget contains a intent categorized as ID
    hasCategory: (state) => (ID) => {
      return state.graph.any(undefined,VFBT('classifiedAs'),ID) == undefined ? false : true
    },
    budgetName: () => (budget) => {
      return decodeURIComponent((new URL(budget.uri.value)).pathname.split('/').pop())
    },
    exampleFolder:() => {
      let folder = (new URL(BASEID)).origin +'/' + PUBLIC_SUBFOLDER + 'examples/'
      console.log(`Example folder: ${folder}`);
      return new URL(folder)
    },
    privateStatus:(state) => {
      return state.ldRessource ? state.ldRessource.includes(PRIVATE_SUBFOLDER) : false
    },
    isOnAdminPod:(state, getters) => {
      return state.examples.length ? state.examples.files.includes(getters.ldRessourceName) : false
    },
    budgetList: (state) => {
      return state.budgetList
    },
    budgetNs: (state, getters) => {
      return $rdf.Namespace(getters.ldRessource + '#');
    },
    expenseClasses: (state) => ({admin}) => {
      let graph = admin ? state.eClassGraphAdmin : state.eClassGraph

      return graph.each(undefined, RDF('type'), RDFS('Class'))
    },
    eClassText: (state) => ({ressource, admin, lang}) => {
      lang = lang || state.locale
      if (admin == undefined)
        admin = false

      let graph = admin ? state.eClassGraphAdmin : state.eClassGraph
      let texts = graph.each(ressource, RDFS('comment'))
      let labels = graph.each(ressource, SKOS('prefLabel'))
      let text = {
        content: '',
        prefLabel: ''
      }

      lang = lang || state.locale
      texts.map(txt => {
        if (txt.lang == lang)
          text.content = txt.value
      })
      labels.map(lbl => {
        if (lbl.lang == lang)
          text.prefLabel = lbl.value
      })
      return text
    },
    hasIncludes: (state) => (ID) => { // returns true if ID (process or intent) is abstract, so has includes
      if (state.graph.any(undefined, VFBT('includedIn'), ID) == undefined) return false
      else return true
    },

    // returns undefined if intent carries no value, else returns the saved value
    hasValue: (state) => (ID) => {
      let value = 0
      let intendedQuantities = state.graph.each(ID, VFBT('intendedQuantity'))

      if (intendedQuantities.length != 0) {
        for (let i = 0; i < intendedQuantities.length; i++) {
          value += parseFloat(state.graph.any(intendedQuantities[i], QUDT('numericValue')).value)
        }
        return value
      }
      return undefined
    },
    isIntent2nd: (state) => (ID) => {
      if (state.graph.statementsMatching(undefined, VFBT('estimatedDemand'), ID).length == 0) return true
      else return false
    },
    isAnnual: (state, getters) => (ID) => { // returns true if intent or any descendants
      // carries no monthly values
      var values = state.graph.each(ID, VFBT('intendedQuantity'))
      // console.log('isAnnual');
      // console.log(values);
      // console.log(JSON.stringify(ID));

      for (var i = 0; i < values.length; i++) {
        // console.log(JSON.stringify(state.graph.any(values[i], DC('valid'))));
        if (state.graph.statementsMatching(values[i], DC('valid')).length != 0) {
          // console.log(JSON.stringify(state.graph.any(values[i], DC('valid'))));
          // console.log('carries monthly values');
          return false
        }
      }
      var descs = getters.descendants(ID)
      for (i = 0; i < descs.length; i++) {
        if (!getters.isAnnual(descs[i])) return false
      }
      return true
    },
    includes: (state) => (ID) => { //returns the list of included IDs for 'ID'
      return state.graph.each(undefined, VFBT('includedIn'), ID)
    },
    includedBy: (state) => (ID) => {
      return state.graph.any(ID, VFBT('includedIn'))
    },
    ascendants: (state) => (ID) => { // return a array of process IDs that are one level more abstract than ID
      return state.graph.each(ID, VFBT('includedIn'))
    },
    descendants: (state) => (ID) => {
      return state.graph.each(undefined, VFBT('includedIn'), ID)
    },
    adminIri: (state) => (admin) => {
      let iri
      let webId = state.webId && new URL(state.webId)
      let baseId = new URL(process.env.VUE_APP_BASEID)

      admin || !state.webId ? iri = (new URL(PUBLIC_SUBFOLDER + 'admin/', baseId.origin)).href :
        iri = (new URL(PUBLIC_SUBFOLDER + 'config/', webId.origin)).href
      iri += 'budget-categories.ttl'
      return iri
    },
    // adminIri for RO access
    budgetCategoriesUrl: (state,getters) => {

      let res = state.graph.statementsMatching(undefined, DC('related'), undefined)
      // console.log(`budgetCategoriesUrl: ${state.graph}`)
      // console.log(JSON.stringify(res))

      if (!res.length) res = getters.adminIri(false)
      else res = res[0].object.value
      // console.log(JSON.stringify(res));
      return res.split('#')[0]
    },
    budgetCategoriesRessource: (state,getters) => ({name}) => { //TODO: don't use object as parameter
      let ressource
      if (state.ro) {
        ressource = getters.budgetCategoriesUrl
        // console.log(`classListData: ${ressource}`);
      } else {
        ressource = getters.adminIri(false)
      }
      return state.graph.sym(ressource + '#' + encodeURI(name))
    },
    topProcess: (state, getters) => () => { //Return the ID of the first process found without ascendants
      var i, sts

      sts = state.graph.statementsMatching(undefined, RDF('type'), VFBT('Process'))

      for (i = 0; i < sts.length; i++) {
        if (getters.ascendants(sts[i].subject).length == 0) return sts[i].subject
      }
      return undefined
    },
    allProcesses: (state, getters) => (which) => { //Return a list with all process names & IDs
      var sts,
        i
      var procs = []
      if (which != undefined) return false
      sts = state.graph.each(undefined, RDF('type'), VFBT('Process'))

      for (i = 0; i < sts.length; i++) {
        procs.push({
          name: getters.processName(sts[i]),
          ID: sts[i]
        })
      }
      return procs
    },
    processes: (state, getters) => (focus) => {
      /* Returns a dictionary with arrays of process objects relative to process 'focus':
          proc['ascendants'] = [{},{}]
          proc['focus']
          proc['descendants']
              Return all processes as an array of { name, value } objects
              Additional getters for getting processes of special level or with
              special tags go here
          */

      var proc = []
      var i,
        name,
        value,
        ascendants,
        descendants,
        eSum,
        iSum

      proc.descendants = []
      proc.ascendants = []
      proc.focus = []

      if (focus == undefined) {
        // Get a process with no ascendants
        focus = getters.topProcess()
      }
      if (focus == undefined) {
        console.log('there are no activities saved in this budget');
        return null
      }
      // console.log(JSON.stringify(focus));
      // console.log('focus: ' + getters.processName(focus))

      ascendants = getters.ascendants(focus)
      descendants = getters.descendants(focus)

      for (i = 0; i < ascendants.length; i++) {
        name = getters.processName(ascendants[i])
        eSum = getters.expenseSum(ascendants[i])
        iSum = getters.incomeSum(ascendants[i])
        value = eSum - iSum
        proc.ascendants.push({
          name,
          eSum,
          iSum,
          value,
          ID: ascendants[i]
        })
      }

      for (i = 0; i < descendants.length; i++) {
        name = getters.processName(descendants[i])
        eSum = getters.expenseSum(descendants[i])
        iSum = getters.incomeSum(descendants[i])
        value = eSum - iSum
        proc.descendants.push({
          name,
          eSum,
          iSum,
          value,
          ID: descendants[i]
        })
      }

      name = getters.processName(focus)
      eSum = getters.expenseSum(focus)
      iSum = getters.incomeSum(focus)
      value = eSum - iSum
      proc.focus.push({
        name,
        eSum,
        iSum,
        value,
        ID: focus
      })

      // console.log(JSON.stringify(proc.descendants));

      return proc;
    },
    lowerProcesses: (state, getters) => (ID) => { //returns a list with all lower processes of ID
      var procs = []
      var descs = getters.descendants(ID)
      // console.log('lowerProcesses:');
      // console.log(JSON.stringify(descs));

      if (descs.length != 0) {
        procs = descs
        for (var i = 0; i < descs.length; i++) {
          var lprocs = getters.lowerProcesses(descs[i])
          if (lprocs != undefined)
            procs = procs.concat(lprocs)
        }
        // console.log(JSON.stringify(procs));
        return procs
      } else {
        return undefined
      }
    },
    // returns a list of intents for process ID in the form of {name,value,ID, classification}
    // if Class != null it returns only intents of this Class
    // if type is `income` return incomes
    intentsList: (state, getters) => (ID, Class, type) => {
      let i,
        name,
        value,
        classification
      let intentIds = type == 'income' ? getters.incomes(ID) : getters.expenses(ID)
      let intents = []

      for (i = 0; i < intentIds.length; i++) {
        name = getters.processName(intentIds[i])
        value = getters.hasValue(intentIds[i])
        classification = getters.classification(intentIds[i])
        // console.log('intentslist' + JSON.stringify(classification));
        // console.log(JSON.stringify(Class));
        // classification = classification ? decodeURIComponent(classification.value) : undefined
        if (Class == undefined || classification == undefined || classification.value == Class.value) intents.push({
            name,
            value,
            classification,
            ID: intentIds[i]
          })
      }
      // console.log('intentsList:');
      // console.log(JSON.stringify(Class));
      // console.log(JSON.stringify(ID));
      // console.log(JSON.stringify(intents));
      return intents
    },

    // returns the total sum of incomes from process ID and descendants.
    incomeSum: (state, getters) => (ID) => {
      let iSum = getters.intentsList(ID, undefined, 'income').map(income => income.value).reduce((a, b) => a + b, 0)

      let desc = getters.descendants(ID)

      desc.map(proc => {
        iSum += getters.incomeSum(proc)
      })
      return iSum
    },
    // returns the total sum of expenses from process ID and descendants for expense category Class.
    expenseSum: (state, getters) => (ID) => {
      return getters.intentsList(ID).map(expense => getters.intentValue(expense.ID)).reduce((a, b) => a + b, 0)
    },
    // returns a list of  total values of intents for process ID
    // if Class is defined only return intentValues for this classification
    intentsTotalList: (state, getters) => (ID, Class) => {
      let intentIds = getters.expenses(ID)
      let intentValues = []
      let classification

      for (let i = 0; i < intentIds.length; i++) {
        classification = getters.classification(intentIds[i]) || undefined
        if (Class == undefined || classification == undefined || classification.value == Class.value) intentValues.push(getters.intentValue(intentIds[i]))
      }
      return intentValues
    },
    // returns a list of  total values of intents per class for process ID
    expCatTotalList: (state, getters) => (ID, categories) => {
      let intentIds = getters.expenses(ID)
      let catValues = new Array(categories.length).fill(0)
      let cat, j
      // console.log('expCatTotalList');
      // console.log(JSON.stringify(categories));
      for (let i = 0; i < intentIds.length; i++) {
        cat = getters.classification(intentIds[i])
        for (j=0;j<categories.length;j++) {
          if (categories[j].value == cat.value) break
        }
        catValues[j] += (getters.intentValue(intentIds[i]))
      }
      // console.log(JSON.stringify(catValues))
      return catValues
    },
    // returns list of expenses ~ estimatedDemands for process 'ID'
    expenses: state => (ID) => {
      return state.graph.each(ID, VFBT('estimatedDemand'))
    },
    // returns list of incomes ~ estimatedSupplies for process 'ID'
    incomes: state => (ID) => {
      return state.graph.each(ID, VFBT('estimatedSupply'))
    },
    intentValue: (state, getters) => (ID) => { // return Value of intent `ID`
      let value = 0
      let intendedQuantities = state.graph.each(ID, VFBT('intendedQuantity'))

      let sts = state.graph.each(undefined, VFBT('includedIn'), ID)
      for (let i = 0; i < sts.length; i++) {
        value += getters.intentValue(sts[i])
      }

      if (intendedQuantities != undefined) {
        for (let i = 0; i < intendedQuantities.length; i++) {
          value += parseFloat(state.graph.any(intendedQuantities[i], QUDT('numericValue')))
        }
      }

      return value
    },
    // returns the cumulated monthly values of self or descendants
    // TODO: test this!
    intentMonthlyValues: (state, getters) => (ID) => {
      let descs = getters.descendants(ID)
      let months = new Array(12).fill(0)
      let descMonths

      if (getters.hasIncludes(ID)) { // add values of lower intents
        for (let i = 0; i < descs.length; i++) {
          descMonths = getters.months(descs[i])
          if (descMonths.length == 0) { // ID is abstract
            let dmvalues = getters.intentMonthlyValues(descs[i])
            for (let j = 0; j < 12; j++) {
              months[j] += dmvalues[j]
            }
          } else {
            for (let j = 0; j < 12; j++) {
              // console.log('intentMonthlyValues');
              // console.log(JSON.stringify(descMonths))
              if (descMonths)
                months[j] += descMonths[j].value
              else
                months[j] += Math.round(getters.intentValue(descs[i]) / 12)
            }
          }
        }
      }
      if (getters.hasValue(ID)) { // Add own value
        let omonths = getters.months(ID)
        if (omonths == false) { // it's an annual value
          months = months.map(month => month += Math.round(getters.hasValue(ID) / 12))
        } else {
          // console.log('monthly');
          // console.log(omonths);
          for (let j = 0; j < 12; j++) {
            months[j] += omonths[j].value
          }
        }
      }
      // console.log(months);
      return months
    },
    isIntent: state => (ID) => {
      var type = state.graph.statementsMatching(ID, RDF('type'), 'Intent')
      if (type) return true
      else return false
    },
    months: state => (ID) => {
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      var values = []
      var month
      var intendedQuantityIds = state.graph.each(ID, VFBT('intendedQuantity'))

      for (let i = 0; i < 12; i++) {
        month = state.graph.any(intendedQuantityIds[i], DC('valid'))
        if (month == undefined) return false
        values[months.indexOf(month.value)] = {
          name: month.value,
          value: parseFloat(state.graph.any(intendedQuantityIds[i], QUDT('numericValue')).value),
          ID: intendedQuantityIds[i]
        }
      }
      return values
    },
    note: state => (ID) => {
      if (ID == undefined) return undefined
      let note = state.graph.any(ID, VFBT('note'))

      return note != undefined ? note.value : undefined
    },
    classification: (state, getters) => (ID) => {
      let sts = getters.includes(ID)
      let Class = state.graph.any(ID, VFBT('classifiedAs'))

      if (Class != undefined) return Class

      if (sts.length != 0) { // get class from lower intents
        for (let i = 0; i < sts.length; i++) {
          Class = getters.classification(sts[i])
          if (Class != undefined) return Class
        }
      }
    },

    // returns a human readable  list of expense category names saved on POD or on admin POD
    classList: (state, getters) => ({list, admin}) => {
      if (admin == undefined)
        admin = false
      let raw = list || getters.expenseClasses(admin)
      if (raw == null) return null

      return raw.map(a => decodeURIComponent(a.value.split('#').pop()))
    },
    // returns all categories used in the loaded budget
    budgetClasses: (state, getters) => () => {
      // https://ilikekillnerds.com/2016/05/removing-duplicate-objects-array-property-name-javascript/
      function removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
      }
      let cats = state.graph.statementsMatching(undefined, VFBT('estimatedDemand')).map(st => getters.classification(st.object))
      return removeDuplicates(cats,'value').map(obj=>obj.value)

    },
    classLabel: (state) => ({ressource,admin}) => {
      if (!ressource) return false
      let graph = admin ? state.eClassGraphAdmin : state.eClassGraph
      let labels = graph.each(ressource, SKOS('prefLabel'))
      // console.log(JSON.stringify(graph));
      // console.log(`classLabel:\nressource: ${ressource}\nlocale:${state.locale}\nlabels: ${JSON.stringify(labels)}`);

      for (let i = 0; i < labels.length; i++) {
        if (labels[i].lang == state.locale) return labels[i].value
      }
      return decodeURIComponent(ressource.value.split('#').pop())
    },
    processName: state => (ID) => { //// TODO: Name should be changed as this can also be used for intents
      let st = state.graph.any(ID, VFBT('name'))
      return st ? st.value : st
    },
    // The process Value is the sum of it's intents: expenses - income
    processValue: (state, getters) => (ID) => {
      return getters.expenseSum(ID) - getters.incomeSum(ID)
    },
    processOfIntent: state => (ID) => { // returns the process ID of the corresponding intent
      return state.graph.any(undefined, VFBT('estimatedDemand'), ID) || state.graph.any(undefined, VFBT('estimatedSupply'), ID)
    },
    iniID: state  => ()=> {
      return state.graph.any(undefined, RDF('type'), ESSGLOBAL('SSEInitiative'))
    },
    iniName: (state, getters) => () => {
      // console.log('iniName graph:\n' + state.graph);
      let st = state.graph.any(getters.iniID(), VFBT('name'))
      // console.log('iniName st:\n' + st);
      if (st != undefined) return st.value
      else return ''
    },
    budgetYear: (state, getters) => () => {
      let st = state.graph.any(getters.budgetNs('validPeriod'), TIME('year'))

      if (st != undefined) return st.value
      else return ''
    },
    stepValue: (state, getters) => () => {
      let st = state.graph.any(getters.budgetNs('budget'), SCHEMA('stepValue'))

      if (st != undefined) return st.value
      else return ''
    },
    numberMembers: (state,getters) => () => {
      // if (state.webId == "") return ''

      let st = state.graph.any(getters.iniID(), ESSGLOBAL('totalOfMembers'))
      // console.log(`members statement: ${st}`);
      if (st != undefined) return parseInt(st)
      else return 0
    },
    currency: (state, getters) => () => { //TODO: might be moved to a store variable for performance reasons
      var st
      st = state.graph.any(getters.budgetNs('budget'), VFBT('budgetUnit'))
      // console.log(state.currencies);
      // console.log(st.value);
      if (st != undefined) {
        return state.currencies.find(x => x.name.value == st.value) ||
          state.currencies.find(x => x.iso == st.value)
      } else return ''
    },
    locale: (state,getters) => () => {
      let locs=getters.currency().locales
      let currency = getters.currency()

      return locs.filter(locale => currency.locales.includes(locale))[0]


    },
    // the URL of the budget
    ldRessource: (state) => {
      if (state.ldRessource == null && state.webId.length > 0) {
        var webId = new URL(state.webId)
        var d = new Date()
        return new URL(PUBLIC_SUBFOLDER, webId.origin) + 'budget-' + d.getTime() + '.ttl'
      } else {
        return state.ldRessource
      }
    },
    // returns the filename of the ressource
    ldRessourceName: (state, getters) => {
      var iri = getters.ldRessource
      if (iri == null) return false
      var url = new URL(iri)
      return url.pathname.split('/').pop()
    },
    preparedFor: (state) => () => {
      var sts = state.graph.statementsMatching(undefined, VFBT('preparedFor'))
      return sts.length > 0 ? sts[0].object : ''
    },
    isLoggedIn: (state) => {
      if (state.session) return true
      else return false
    }
  },

  mutations: {
    BudgetList(state) {
      state.budgetList = null
    },
    setLdRessource(state, iri) {
      state.ldRessource = iri
    },
    setSession(state, newsession) {
      console.log('Set new session');
      state.session = newsession
    },
    setGraph(state, graph) {
      state.graph = graph
    },
    setWebId(state, webId) {
      state.webId = webId
    },
    setName(state, name) {
      state.name = name
    },
    setLoggedIn(state, loggedIn) {
      state.loggedIn = loggedIn
    },
    addAnnualValue(state, {ID, value}) {
      var sts = []
      var intendedQuantityId = newBlankNode(state)

      sts.push(new $rdf.Statement(ID, VFBT('intendedQuantity'), intendedQuantityId))

      sts.push(new $rdf.Statement(intendedQuantityId, QUDT('numericValue'), new $rdf.Literal(value.toString(),undefined,XSD('decimal'))))
      console.log(`addAnnualValue Statements:\n${JSON.stringify(sts)}`);
      state.graph.addAll(sts)
    },
    addMonthlyValues(state, {ID, months}) {
      var sts = []
      var intendedQuantityId = newBlankNode(state)

      for (var i = 0; i < 12; i++) {
        sts.push(new $rdf.Statement(ID, VFBT('intendedQuantity'), intendedQuantityId))
        sts.push(new $rdf.Statement(intendedQuantityId, QUDT('numericValue'), new $rdf.Literal(months[i].value.toString(),undefined,XSD('decimal'))))
        sts.push(new $rdf.Statement(intendedQuantityId, DC('valid'), months[i].name))
        intendedQuantityId = newBlankNode(state)
      }
      console.log('addMonthlyValues: ' + JSON.stringify(sts));
      state.graph.addAll(sts)
    },
    includeIntent(state, {ID1, ID2}) { //ID1 gets included in ID2
      var sts = []
      sts.push(new $rdf.Statement(ID1, VFBT('includedIn'), ID2))

      console.log('includeIntent: ' + sts);
      state.graph.addAll(sts)
    },
    addStatements(state, statements) {
      state.graph.addAll(statements)
    },

    changeIntentValue(state, {ID, value}) {
      var intendedQuantity = state.graph.any(ID, VFBT('intendedQuantity'))
      var st = state.graph.statementsMatching(intendedQuantity, QUDT('numericValue'))

      state.graph.remove(st)
      console.log('remove: ' + st)

      st = []
      st.push(new $rdf.Statement(intendedQuantity, QUDT('numericValue'), new $rdf.Literal(value.toString(),undefined,XSD('decimal'))))
      state.graph.addAll(st)
      console.log('add: ' + st)

      return true
    },
    changeMonthlyValue(state, {ID, value}) {
      var st = state.graph.statementsMatching(ID, QUDT('numericValue'))

      state.graph.remove(st)
      console.log('remove: ' + st)

      st = []
      st.push(new $rdf.Statement(ID, QUDT('numericValue'), new $rdf.Literal(value.toString(),undefined,XSD('decimal'))))
      state.graph.addAll(st)
      console.log('add: ' + st)

      return true
    },
    removeStatement(state, statement) {
      try {
        state.graph.remove(statement) //this can also be  statement arrays, graphs...
      } catch (err) {
        console.log(err);
      }
    },
    resetGraph(state) {
      state.graph = new $rdf.graph()
    }
  },
  actions: {
    changeStepValue({state, getters}, newStepValue) {
      let sts = state.graph.statementsMatching(undefined, SCHEMA('stepValue'), undefined)
      console.log('remove: ' + sts)
      state.graph.remove(sts)
      sts = []
      sts.push(new $rdf.Statement(getters.budgetNs('budget'), SCHEMA('stepValue'), new $rdf.Literal(newStepValue.toString(), undefined, XSD('decimal'))))
      state.graph.addAll(sts)
      console.log('add: ' + sts)

      state.decimals = newStepValue == '0.01' ? true : false

      return true
    },
    changeMembersNumber({state, getters}, newNumberMembers) {
      let sts = state.graph.statementsMatching(undefined, ESSGLOBAL('totalOfMembers'), undefined)
      console.log('remove: ' + sts)
      state.graph.remove(sts)
      sts = []
      sts.push(new $rdf.Statement(getters.iniID(), ESSGLOBAL('totalOfMembers'), new $rdf.Literal(newNumberMembers.toString(), undefined, XSD('int'))))
      state.graph.addAll(sts)
      console.log('add: ' + sts)

      return true
    },
    changeIniName({state,getters}, newIniName) {
      var sts = state.graph.statementsMatching(getters.iniID(), VFBT('name'), undefined)
      console.log('remove: ' + sts)
      state.graph.remove(sts)
      sts = []
      sts.push(new $rdf.Statement(getters.iniID(), VFBT('name'), newIniName))
      state.graph.addAll(sts)
      console.log('add: ' + sts)

      return true
    },
    async readExampleFolder({state, getters}) { //TODO: DEBUG, doesn't work

      let loc =  getters.exampleFolder
      return new Promise((resolve, reject) => {
        fileClient.readFolder(loc).then(
          folder => {
            state.examples = folder
            console.log(`Loaded example folder: ${JSON.stringify(folder)}`)
            resolve(folder)
          }, err => {
            console.log(`Error while reading folder ${loc}: ${err}`)
            reject (err)
          }
        )
      })
    },
    async togglePrivateMode({getters,dispatch}, privateStatus) {
      let subfolder = privateStatus ? PRIVATE_SUBFOLDER : PUBLIC_SUBFOLDER
      let oldUrl=getters.ldRessource
      let newUrl= (new URL(subfolder + getters.ldRessourceName, (new URL(oldUrl)).origin)).href
      console.log(`copying data from ${oldUrl} to ${newUrl}`);

      await dispatch('substituteWhy', {oldUrl, newUrl})
      await dispatch('changeLdRessource', {oldUrl, newUrl})
      await dispatch('saveRessource',newUrl)
      fileClient.deleteFile(oldUrl)

      // TODO debug
      // fileClient.copyFile(old,newLoc).then(() => {
      //   console.log(`Copied ${old} to ${newLoc}.`);
      // }, err => console.log(err) );
    },
    async toggleExampleStatus({getters,dispatch}, exampleStatus) {
      let oldUrl=getters.ldRessource
      let newUrl = getters.exampleFolder + getters.ldRessourceName
      if (!exampleStatus) {
        dispatch('deleteRessource', newUrl)
      } else {
        await dispatch('substituteWhy', {oldUrl, newUrl})
        await dispatch('changeLdRessource', {oldUrl, newUrl})
        await dispatch('saveRessource',newUrl)
      }
    },
    async addProcess({state, getters} , {name, ID}) {
      return new Promise((resolve) => {
        console.log(`add process ${name}`);
        let sts = []
        let encodedUri = encodeURI(name)
        let ressource = getters.budgetNs(encodedUri)

        if (ID != undefined)
          ID.value = ressource
        sts.push(new $rdf.Statement(ressource, RDF('type'), VFBT('Process')))
        sts.push(new $rdf.Statement(ressource, VFBT('name'), name))
        state.graph.addAll(sts)
        resolve()
      })
    },
    async addRelation({commit}, rel) {
      var sts = []

      console.log('higher: ' + rel.higher);
      console.log('lower: ' + rel.lower);

      sts.push(new $rdf.Statement(rel.lower, VFBT('includedIn'), rel.higher))
      commit('addStatements', sts)
    },
    changeCurrency({getters, state} , newCurrency) {
      var sts = state.graph.statementsMatching(getters.budgetNs('budget'), VFBT('budgetUnit'), undefined)
      console.log('remove: ' + sts)
      state.graph.remove(sts)
      sts = []
      sts.push(new $rdf.Statement(getters.budgetNs('budget'), VFBT('budgetUnit'), newCurrency))
      state.graph.addAll(sts)
      console.log('add: ' + sts)

      return true
    },
    changeYear({getters, state} , newYear) {
      let sts = state.graph.statementsMatching(getters.budgetNs('validPeriod'), TIME('year'), undefined)
      console.log('remove: ' + sts)
      state.graph.remove(sts)
      sts = []

      sts.push(new $rdf.Statement(getters.budgetNs('validPeriod'), TIME('year'), new $rdf.Literal(newYear.toString(), undefined, XSD('gYear'))))
      state.graph.addAll(sts)
      console.log('add: ' + sts)

      return true
    },
    async createIntent({commit, state} , {name, value, ID, months}) { //ID for return value.
      var sts = []
      var intentId = newBlankNode(state)
      if (ID != undefined) {
        ID.value = intentId
        console.log('intentId: ' + JSON.stringify(ID.value));
      }

      sts.push(new $rdf.Statement(intentId, RDF('type'), VFBT('Intent')))
      sts.push(new $rdf.Statement(intentId, VFBT('name'), name))

      if (value >= 0) commit('addAnnualValue', {
          ID: intentId,
          value
        })
      if (months) commit('addMonthlyValues', {
          ID: intentId,
          months
        })

      commit('addStatements', sts)
    },
    async removeIntent({commit, getters, dispatch, state} , intent) { //removes all relations to intent
      var st,
        i,
        intents,
        j,
        k,
        includedIntents

      var proc = getters.processOfIntent(intent)
      var ascendants = getters.processes(proc).ascendants

      console.log('remove Intent');
      console.log(JSON.stringify(proc));

      st = state.graph.statementsMatching(proc, VFBT('estimatedDemand'), intent)
      if (!st.length)
        st = state.graph.statementsMatching(proc, VFBT('estimatedSupply'), intent)

      commit('removeStatement', st)

      console.log(JSON.stringify(intent));
      console.log(JSON.stringify(ascendants));

      for (i = 0; i < ascendants.length; i++) {
        intents = getters.expenses(ascendants[i].ID) //intents of ascendant
        console.log(JSON.stringify(intents));
        for (j = 0; j < intents.length; j++) {
          includedIntents = getters.includes(intents[j])

          console.log(JSON.stringify(includedIntents));
          for (k = 0; k < includedIntents.length; k++) {
            if (includedIntents[k] == intent) { // intent is included
              console.log('remove asc intent');
              //remove inclusion
              st = new $rdf.Statement(intent, VFBT('includedIn'), intents[j])
              commit('removeStatement', st)
              if (includedIntents.length == 1 && !getters.hasValue(intents[j])) {
                //remove asc intent
                await dispatch('destroyIntent', intents[j])
              }
            }
          }
        }
      }
    },
    // Changes the label of a process or a intent,
    // merges abstract intents if set to same name
    changeLabel({state, getters, dispatch} , {ID, newName}) {
      return new Promise((resolve, reject) => {
        let proc = getters.processOfIntent(ID)
        let Class = getters.classification(ID) || undefined
        let rmsts = []
        let addsts = []

        // if this is a intent, it is abstract and a sibling intent with same new name exists
        // join own included IDs to sibling and destroy self.
        // only do that if intents are of the same class

        if (getters.isIntent(ID) && getters.hasIncludes(ID)) {
          console.log('changeLabel to ' + newName);

          let intents = getters.expenses(proc) // sibling intents

          for (let j = 0; j < intents.length; j++) {
            if (getters.processName(intents[j]) == newName) {
              console.log("Intent with same name " + newName + " and category " + Class);
              let oClass = getters.classification(intents[j]) || undefined
              if (oClass.value != Class.value) {
                console.log(oClass)
                console.log(Class);
                console.log('Intents  have not the same category');
                reject('not same class')
                return false
              }

              // join includes from ID to intents[j]
              let includes = getters.includes(ID)
              for (let i = 0; i < includes.length; i++) {
                addsts.push(new $rdf.Statement(includes[i], VFBT('includedIn'), intents[j]))
              }
              //destroy intent
              dispatch('destroyIntent', ID)

              state.graph.addAll(addsts)

              resolve('joined intent')
              return true
            }
          }
        }
        rmsts.push(state.graph.statementsMatching(ID, VFBT('name'), undefined))
        addsts.push(new $rdf.Statement(ID, VFBT('name'), newName))

        state.graph.remove(rmsts)
        state.graph.addAll(addsts)

        console.log('add: ' + addsts)
        console.log('remove: ' + rmsts)

        resolve('changed label')
      })
    },
    changeNote({getters, state} , {ID, newNote}) {
      function addNote(ID, newNote) {
        var sts = []
        console.log('addnote');

        sts.push(new $rdf.Statement(ID, VFBT('note'), newNote))

        state.graph.addAll(sts)
      }
      function removeNote(ID) {
        var sts = state.graph.statementsMatching(ID, VFBT('note'), undefined)
        console.log('removenote');
        state.graph.remove(sts)
      }
      if (getters.note(ID) == '') {
        addNote(ID, newNote)

      } else {
        removeNote(ID)
        addNote(ID, newNote)
      }

    },
    // Change expense Category of expense ID
    changeClass({getters, state} , {ID, newClass}) {
      function addClass(ID, newClass) {
        var sts = []

        sts.push(new $rdf.Statement(ID, VFBT('classifiedAs'), newClass))

        state.graph.addAll(sts)
      }
      function removeClass(ID) {
        var sts = state.graph.statementsMatching(ID, VFBT('classifiedAs'), undefined)

        state.graph.remove(sts)
      }
      if (getters.classification(ID) == undefined) {
        addClass(ID, newClass)

      } else {
        removeClass(ID, newClass)
        addClass(ID, newClass)
      }

    },
    //removes Process and adds all its intents to ascendant or optionally destroys them
    // TODO: implement destroy in UI
    deleteProcess({dispatch, getters, state} , {proc, destroy}) {
      let i
      let st = []
      let sts = []
      let expenses = getters.expenses(proc)
      let incomes = getters.incomes(proc)
      let ascendant = getters.ascendants(proc)[0] // needs to be changed if ever allow for more than one ascendant

      // add associated expenses to asceding process or destroy them
      for (i = 0; i < expenses.length; i++) {
        if (destroy || getters.hasIncludes(expenses[i])) {
          dispatch('destroyIntent', expenses[i])
        } else {
          if (!getters.hasIncludes(expenses[i])) {
            dispatch('removeIntent', expenses[i])
            dispatch('addExpenseId', {
              intentId: expenses[i],
              processId: ascendant
            })
          }
        }
      }

      incomes.map(income => {
        dispatch('removeIntent', income)
        dispatch('addIncomeId', {
          incomeId: income,
          processId: ascendant
        })
      })
      // destroy all mentions of process
      sts.push(new $rdf.Statement(proc, RDF('type'), VFBT('Process')))
      sts.push(state.graph.statementsMatching(proc, VFBT('name'), undefined))
      sts.push(state.graph.statementsMatching(proc, VFBT('includedIn'), undefined))

      st = state.graph.statementsMatching(undefined, VFBT('includedIn'), proc)

      if (st.length != 0) { // existing lower order processes move to ascendant
        sts.push(st)
        for (i = 0; i < st.length; i++) {
          dispatch('addRelation', {
            lower: st[i].subject,
            higher: ascendant
          })
        }
      }
      console.log(JSON.stringify(sts));
      state.graph.remove(sts)
    },
    async moveProcess({commit, dispatch, getters} , {proc, nproc}) {
      var i
      var sts = []
      var ascendant = getters.ascendants(proc)[0] // needs to be changed if ever allow for more than one ascendant
      var intents = getters.expenses(proc)

      for (i = 0; i < intents.length; i++) {
        await dispatch('removeIntent', intents[i])
      }

      sts.push(new $rdf.Statement(proc, VFBT('includedIn'), ascendant))
      commit('removeStatement', sts)

      await dispatch('addRelation', {
        lower: proc,
        higher: nproc
      })

      for (i = 0; i < intents.length; i++) {
        await dispatch('addExpenseId', {
          intentId: intents[i],
          processId: proc
        })
      }

    },
    async removeValues({commit, state} , intent) {
      var st = state.graph.statementsMatching(intent, VFBT('intendedQuantity'))
      var sts = [...st]
      for (var i = 0; i < st.length; i++) {
        sts.push(state.graph.statementsMatching(st[i].object, DC('valid'), undefined))
        sts.push(state.graph.statementsMatching(st[i].object, QUDT('numericValue'), undefined))
      }
      console.log('removeValues, removing statements:' + JSON.stringify(sts));
      commit('removeStatement', sts)
    },
    //removes all statements regarding intent
    async destroyIntent({commit, dispatch, state, getters} , intent) {
      var sts = []
      var st,
        st2

      // if intent is sublevel only destroy TODO: better document
      console.log(JSON.stringify(state.graph.statementsMatching(undefined, VFBT('estimatedDemand'), intent)))
      if (state.graph.statementsMatching(undefined, VFBT('estimatedDemand'), intent).length ||
        state.graph.statementsMatching(undefined, VFBT('estimatedSupply'), intent).length)
        dispatch('removeIntent', intent)
      else {
        st = state.graph.statementsMatching(intent, VFBT('includedIn'), undefined)
        sts.push(st)
        state.graph.remove(sts)
        sts = []
        st2 = getters.includes(st[0].object)
        JSON.stringify(st2)
        if (st2.length == 1) {
          console.log('leftover cleanup');
          await dispatch('addExpenseId', {
            intentId: st2[0],
            processId: getters.processOfIntent(st[0].object)
          })
          await dispatch('destroyIntent', st[0].object)
        }
      }
      sts.push(new $rdf.Statement(intent, RDF('type'), VFBT('Intent')))
      sts.push(state.graph.statementsMatching(intent, VFBT('name'), undefined))
      sts.push(state.graph.statementsMatching(intent, VFBT('note'), undefined))
      sts.push(state.graph.statementsMatching(intent, VFBT('classifiedAs'), undefined))
      sts.push(state.graph.statementsMatching(undefined, VFBT('includedIn'), intent))

      await dispatch('removeValues', intent)

      console.log('destroyIntent, removing statements:' + JSON.stringify(sts));
      commit('removeStatement', sts)
    },
    async destroyExpenseClass({getters, state, dispatch} , {ressource, admin}) {
      return new Promise(async (resolve, reject) => {
        let graph = admin ? state.eClassGraphAdmin : state.eClassGraph

        await graph.removeMany(ressource)

        if (!graph.statements.length) {
          fileClient.deleteFile(getters.adminIri(admin)).then((suc) => resolve(suc), (err) => reject(err))
        } else {
          await dispatch('saveAdminRessource', {
            admin,
            graph
          }).then((suc) => resolve(suc), (err) => reject(err))
        }
      })
    },
    // adds intentId recursively to processId and ascendants
    async addExpenseId({commit, getters, dispatch} , {intentId, processId}) {
      var i,
        j
      var sts = []
      var intents = []
      var ascendants = getters.ascendants(processId)
      var ascint = []

      sts.push(new $rdf.Statement(processId, VFBT('estimatedDemand'), intentId))
      for (i = 0; i < ascendants.length; i++) {
        // if ascendant already possesses an abstract intent with the same name as intentId,
        // include intentId into that intent else create new intent for including intentId
        intents = getters.expenses(ascendants[i])

        ascint = []
        for (j = 0; j < intents.length; j++) {
          if (getters.hasIncludes(intents[j]) &&
            getters.processName(intents[j]) == getters.processName(intentId)) {
            console.log("Intents with same name: " + getters.processName(intentId));
            ascint.value = intents[j]
            break
          }
        }
        if (!ascint.value) {
          dispatch('createIntent', {
            name: getters.processName(intentId),
            ID: ascint
          })
          await dispatch('addExpenseId', {
            processId: ascendants[i],
            intentId: ascint.value
          })
          console.log('created intent with ID: ' + ascint.value);
        }
        sts.push(new $rdf.Statement(intentId, VFBT('includedIn'), ascint.value))
      }
      console.log('addExpenseId, added statements: ' + JSON.stringify(sts))
      commit('addStatements', sts)
    },
    // adds incomeId to processId
    async addIncomeId({commit}, {incomeId, processId}) {
      let sts = []

      sts.push(new $rdf.Statement(processId, VFBT('estimatedSupply'), incomeId))
      console.log('addIncomeId, added statements: ' + JSON.stringify(sts))
      commit('addStatements', sts)
    },
    add2ndIntent({commit, getters, dispatch} , {IntInc, ID, proc}) { //add ID as 2nd level intent to IntInc
      var ID2 = {}
      // if IntInc is not abstract we need to make it abstract
      if (!getters.hasIncludes(IntInc.ID)) {
        console.log('saveIntent:');
        console.log(JSON.stringify(IntInc));

        console.log('createIntent');

        dispatch('createIntent', {
          name: IntInc.name,
          ID: ID2
        })

        console.log('addExpenseId');
        console.log(JSON.stringify(ID2.value));
        // console.log(JSON.stringify(getters.processName(ID2.value)))

        dispatch('addExpenseId', {
          intentId: ID2.value,
          processId: proc
        })

        console.log('removeIntent:');

        dispatch('removeIntent', IntInc.ID)

        console.log('includeIntent');

        commit('includeIntent', {
          ID1: IntInc.ID,
          ID2: ID2.value
        })
        commit('includeIntent', {
          ID1: ID,
          ID2: ID2.value
        })
      } else {
        commit('includeIntent', {
          ID1: ID,
          ID2: IntInc.ID
        })
      }
    },
    async testSession({state,dispatch}) {
      // tests for read access of private subfolder, reveals broken sessions
      // creates missing subfolders

      console.log('testSession')
      return new Promise(async (resolve, reject) => {
        if (!state.webId) reject('defunct')
        let webId = new URL(state.webId)
        let url = new URL(PRIVATE_SUBFOLDER, webId.origin)
        await dispatch('loadBudgetListFrom', url).then(
          () => resolve('working'),
          (err) => {
            if (err=='app not authenticated' || err == 'not authenticated') {
              console.log(err);

              reject (err)
              return
            }
            console.log(`Private subfolder not loadable. Errorcode: ${err}`);
            fileClient.createFolder(url.href).then(
              ()  => {
                console.log('successfully created private subfolfder')
                resolve('working')
              },
              err => {
                console.log(`couldn't create private subfolder. Err: ${err}`)
                reject('defunct')
              }
            )
          }
        )
      })
    },
    async trackSession({commit, state, dispatch}) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          auth.trackSession(async session => {
            let webId, name
            console.log(JSON.stringify(session));
            if (session && (state.session != session)) {
              commit('setSession', session)
              webId = session.webId
              if (state.ldflex) {
                try {
                  name = await data.user.name
                } catch(err) {
                  name = ''
                  console.log(`An error appeared while trying to get SoLiD username:\n${err}`);
                }
              } else {
                name = ''
              }
              console.log('Newly logged in as: ' + name)

              await dispatch('loadAdmins').then(async () => {
                commit('setWebId', webId)
                commit('setName', name)
                state.admins.includes(state.webId) ? state.admin = true : state.admin = false
                state.ro=false
                dispatch('loadAdminRessource', true)
                dispatch('loadAdminRessource', false)
                await dispatch('testSession').then(
                  () => resolve(session),
                  (err) => {
                    console.log(err)
                    reject(err)
                  }
                )
              }, err => {
                console.log(`Something went wrong while logging in. Status code: ${JSON.stringify(err)}`)
                auth.logout()
                this.$router.push('config')
                reject('login failure')
              })
            } else {
              state.session = null
              console.log('something went wrong while loggin in.');
              reject('not logged in')
              return false
            }
          })
        }, 1000)
      })
    },
    initGraph({commit, state, getters, dispatch}) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          let sts = []

          state.graph = $rdf.graph()

          console.log('initGraph:');
          console.log(state.webId);
          commit('setLdRessource', null)

          sts.push(new $rdf.Statement($rdf.sym(state.webId), RDF('type'), ESSGLOBAL('SSEInitiative')))
          sts.push(new $rdf.Statement($rdf.sym(state.webId), VFBT('name'), 'CSA'))
          sts.push(new $rdf.Statement($rdf.sym(state.webId), ESSGLOBAL('totalOfMembers'), new $rdf.Literal('77',undefined,XSD('int'))))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), RDF('type'), VFBT('Budget')))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), VFBT('preparedFor'), $rdf.sym(state.webId)))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), VFBT('budgetUnit'), DBPEDIA('Euro')))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), SCHEMA('stepValue'), new $rdf.Literal('1', undefined, XSD('decimal'))))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), DC('valid'), getters.budgetNs('validPeriod')))
          sts.push(new $rdf.Statement(getters.budgetNs('validPeriod'), RDF('type'), TIME('DateTimeDescription')))
          sts.push(new $rdf.Statement(getters.budgetNs('budget'), DC('related'), $rdf.sym(getters.adminIri(false))))
          sts.push(new $rdf.Statement(getters.budgetNs('validPeriod'), TIME('year'), new $rdf.Literal((new Date()).getFullYear().toString(),undefined,XSD('gYear'))))

          state.graph.addAll(sts)

          await dispatch ('loadExpenseCategories')

          console.log('init graph:');
          console.log(JSON.stringify(state.graph));
          resolve()
        }, 1000
        )
      })
    },
    async loadBudget({commit, state, getters,dispatch} , url) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          var graph = $rdf.graph()

          if (url == undefined) {
            if (!state.budgetList.length) {
              reject('no more budgets saved')
              return false
            }
            url = state.budgetList.pop().uri.value
          }

          console.log('Loading budget:');
          console.log(url);

          solidFetch({state, url})
            .then(
              function(response) {
                if (response.status !== 200) {
                  console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                  reject(response.status)
                  return;
                }

                // Examine the text in the response
                response.text().then(async function(text) {
                  try {
                    $rdf.parse(text, graph, url, mimeType)
                    commit('setGraph', graph)
                    commit('setLdRessource', url)
                    // console.log('graph:\n' + graph)
                    await dispatch ('loadExpenseCategories')
                    state.decimals = getters.stepValue() == '0.01' ? true : false
                    resolve(url)
                  } catch (err) {
                    console.log(err)
                    reject(err)
                  }
                })
              }
          )
        }, 1000)
      })
    },
    // eslint-disable-next-line no-empty-pattern
    deleteRessource({}, uri) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('Deleting ressource:');
          console.log(JSON.stringify(uri));
          auth.fetch(uri, {
            method: 'DELETE'
          })
            .then(
              function(response) {
                if (response.status !== 200) {
                  console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                  return;
                }

                // Examine the text in the response
                response.text().then(function(text) {
                  try {
                    // dispatch('loadBudgetList')
                    console.log('response:\n' + JSON.stringify(text))
                    resolve()
                  } catch (err) {
                    reject(err)
                    console.log(err)
                  }
                })
              }
          )
        }, 1000)
      })
    },
    loadAdmins({state}) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const baseId = new URL(process.env.VUE_APP_BASEID)

          const iri = (new URL(PUBLIC_SUBFOLDER + 'admins.ttl', baseId.origin)).href
          let graph = new $rdf.graph()
          console.log('Loading group document:');
          console.log(iri);

          auth.fetch(iri, {
            method: 'GET',
          }).then(
            function(response) {
              // console.log(response.headers.get('link'));
              if (response.status == 401) reject(response)
              else {
                response.text().then(function(text) {
                  try {
                    // console.log(response);

                    $rdf.parse(text, graph, iri, mimeType)
                    let admins = graph.each(new $rdf.sym(iri + '#admins'), VCARD('hasMember'))
                    state.admins = admins.map(a => a.value)
                    resolve()
                  } catch (err) {
                    // console.log(err)
                    reject(err)
                  }
                })
              }
            }
          )
        }, 1000)
      })
    },
    async loadBudgetList({state,dispatch}) {
      function sortByKey(array, key) { // from: https://stackoverflow.com/a/8837505/10086477
        return array.sort(function(a, b) {
          let x = a[key];
          let y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }
      return new Promise((resolve, reject) => {
        setTimeout(async () => {

          if (!state.webId) return
          let webId = new URL(state.webId)

          state.budgetList = []
          try {
            await dispatch('loadBudgetListFrom', new URL(PUBLIC_SUBFOLDER, webId.origin)).then(list=> state.budgetList.push(...list), err => console.log(`Something went wrong while loading public budgets ${err}`))
            await dispatch('loadBudgetListFrom', new URL(PRIVATE_SUBFOLDER, webId.origin)).then(
              list=> state.budgetList.push(...list),
              err => {
                console.log(`error while loading private budget list: ${err}`);
                reject(err)
              }
            )
            sortByKey(state.budgetList, 'mtime') // TODO: make it optionally alpabetically sorted,
            console.log('saved Budgets:\n' + JSON.stringify(state.budgetList))
          } catch (error){
            console.log(`While loading the budget lists there had been error: ${error}`)
          }

          state.budgetList.length != 0 ? resolve() : reject('nothing saved')
        })
      })
    },
    async loadBudgetListFrom({state}, loc) {
      function sortByKey(array, key) { // from: https://stackoverflow.com/a/8837505/10086477
        return array.sort(function(a, b) {
          let x = a[key];
          let y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let graph = $rdf.graph()


          console.log('Load budget List from location:');
          console.log(loc.href);
          solidFetch({state, url:loc.href})
            .then((response) => {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                if (response.status == 401) reject('not authenticated')
                if (response.status == 403) reject('app not authenticated')
                if (response.status == 404) reject('nothing saved')

                reject(response.status)
                return
              } else {
                console.log(`successfully loaded budgetlist: ${response.status}`)
              }

              // Examine the text in the response
              response.text().then((text) => {
                try {
                  $rdf.parse(text, graph, loc.href, mimeType)
                } catch (err) {
                  console.log(err)
                  reject()
                }

                let cleanedBL = []
                let budgetList = graph.each(new $rdf.sym(loc.href), LDP('contains'))
                console.log(`loaded BudgetList: ${budgetList}`);
                if (budgetList.length) {
                  for (let i = 0; i < budgetList.length; i++) {
                    let mtime = graph.any(budgetList[i], POSIX('mtime')).value
                    if (graph.statementsMatching(budgetList[i], RDF('type'), LDP('Container')).length == 0
                      && !budgetList[i].value.includes('/admins.ttl')) cleanedBL.push({
                        uri: budgetList[i],
                        mtime
                      })
                  }
                }
                sortByKey(cleanedBL, 'mtime')
                resolve(cleanedBL)
              })
            }
          )
        }, 1000)
      }
      )
    },
    // eslint-disable-next-line no-empty-pattern
    listContainer({}, loc) { //Lists all non-container ressources in loc
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let graph = $rdf.graph()

          console.log('Load container:');
          console.log(loc);
          auth.fetch(loc)
            .then(
              function(response) {
                if (response.status !== 200) {
                  console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                  reject(response.status)
                  return;
                }

                // Examine the text in the response
                response.text().then(function(text) {
                  try {
                    $rdf.parse(text, graph, loc, mimeType)
                  } catch (err) {
                    console.log(err)
                    reject()
                  }
                  // console.log(JSON.stringify(graph));
                  let list = graph.each(new $rdf.sym(loc), LDP('contains'))
                  let lst = []
                  if (list.length == 0) {
                    reject('nothing saved')
                  } else {
                    for (let i = 0; i < list.length; i++) {
                      if (graph.statementsMatching(list[i], RDF('type'), LDP('Container')).length == 0)
                        lst.push(list[i].value)
                    }
                    console.log('saved texts:\n' + JSON.stringify(lst))
                    resolve(lst)
                  }
                })
              }
          )
        }, 1000)
      }
      )
    },
    // load expense category texts for budget url for RO view
    // params types:
    //  url: URL of budget

    async  loadExpenseCategories({state, getters}) {
      let url = getters.budgetCategoriesUrl
      if (! url) return false
      console.log(`loading expense categories for: ${url}`);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let graph = new $rdf.graph()

          fetch(url, {
            method: 'GET',
          }).then(
            function(response) {
              // console.log(response.headers.get('link'));
              if (response.status != 200) reject(response)
              else {
                response.text().then(function(text) {
                  try {
                    // console.log(response);

                    $rdf.parse(text, graph, url, mimeType)
                    state.eClassGraph = graph
                    let cats = graph.each(undefined,RDF('type')).map(st => st.value)
                    let bcats = getters.budgetClasses()
                    console.log(`Available expense categories: ${JSON.stringify(cats,null,4)}`);
                    console.log(`Expense categories used in the budget: ${JSON.stringify(bcats,null,4)}`);
                    bcats.map(bcat => {
                      if (!cats.includes(bcat)) {
                        console.log(`Warning! Undefined expense category ${bcat}`)
                        reject({msg: 'undefined expense category', cat: bcat})
                      }
                    })
                    resolve()
                  } catch (err) {
                    // console.log(err)
                    reject(err)
                  }
                })
              }
            }
          )
        })
      })
    },
    async copyAdminRessource({getters,state, dispatch}) {
      return new Promise((resolve, reject) => {
        let from = getters.adminIri(true)
        let to = getters.adminIri(false)
        console.log('copy ' + from + ' to ' + to);
        $rdf.fetcher(state.graph).webCopy(from, to, 'unknown')
        //TODO: Debug why text/turtle doesn't work
          .then(async res => {
            console.log('copy done ' + JSON.stringify(res));
            dispatch('loadAdminRessource', false).then(()=>resolve(),()=>reject())
          }, e => {
            console.log ("Error copying : " + e)
            reject(e)
          })
      })
    },
    async loadAdminRessource({getters, state, dispatch} ,admin) {
      return new Promise((resolve, reject) => {
        let url = getters.adminIri(admin)
        fileClient.fetchAndParse(url, 'text/turtle').then(graph => {
          console.log(`loaded ${graph}`);
          admin ? state.eClassGraphAdmin = graph : state.eClassGraph = graph
          resolve()
        }, async (err) => {
          console.log(`failed fetching ${url}`)
          console.log(`error code: ${err}`);
          if (!admin && (err.substr(0, 3) == '404')) {
            dispatch('copyAdminRessource')
          } else {
            console.log('init graph');
            admin ? state.eClassGraphAdmin = $rdf.graph() : state.eClassGraph = $rdf.graph()
          }
          reject()
        })
      })
    },
    async saveAdminRessource({getters}, {admin, graph}) {
      return new Promise((resolve, reject) => {
        let iri = getters.adminIri(admin)
        let data = $rdf.serialize(undefined, graph, iri, 'text/turtle')
        // console.log(`Saving ${data} to ${iri} as admin ${admin}`)
        fileClient.updateFile(iri, data).then((suc) => {
          console.log(`Updated ${iri}.`)
          resolve(suc)
        }, err => {
          console.log(err)
          reject(err)
        })
      })
    },
    // change or add expense category description
    async changeExpenseClass({state, dispatch} , {admin, ressource, content, loc, label}) {
      return new Promise((resolve, reject) => {
        // console.log(`label: ${JSON.stringify(label,null,4)}`);

        if (!ressource) return false

        let sts = []
        let graph = admin ? state.eClassGraphAdmin : state.eClassGraph

        content = content || ''

        let rmsts = []
        let cmsts = graph.match(ressource, RDFS('comment'), null)
        cmsts.map(st => {
          if (st.object.lang == loc) rmsts.push(st)
        })
        let slbsts = graph.match(ressource, SKOS('prefLabel'), null)
        slbsts.map(st => {
          if (st.object.lang == loc) rmsts.push(st)
        })
        let lbsts = graph.match(ressource, RDFS('label'), null)

        console.log(`Removing:\n${JSON.stringify(rmsts, null, 4)}\nfrom:\n${JSON.stringify(ressource, null, 4)}`);

        if (rmsts.length == 0) {
          sts.push(new $rdf.Statement(ressource, RDF('type'), RDFS('Class')))
          if (lbsts.length == 0) sts.push(new $rdf.Statement(ressource, RDFS('label'), $rdf.literal(label, loc)))
        } else {
          graph.remove(rmsts)
        }
        // console.log(`removed!`);
        sts.push(new $rdf.Statement(ressource, RDFS('comment'), $rdf.literal(content, loc)))
        sts.push(new $rdf.Statement(ressource, SKOS('prefLabel'), $rdf.literal(label, loc)))
        // console.log(`Adding statements:\n${JSON.stringify(sts, null,4)}`)
        graph.addAll(sts)

        dispatch('saveAdminRessource', {
          admin,
          graph
        }).then((suc) => resolve(suc), (err) => reject(err))
      })
    },
    // eslint-disable-next-line no-empty-pattern
    saveRessource({}, iri) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // console.log(`graph:\n${this.state.graph}`);
          var data = $rdf.serialize(undefined, this.state.graph, iri, 'text/turtle')

          console.log(`Saving resource: ${iri}`)

          auth.fetch(iri, {
            method: 'PUT',
            headers: {
              "Content-Type": mimeType
            },
            body: data
          }).then(
            function(response) {
              if (response.status !== 201) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                reject(response.status)
              }
              else resolve('all right')
            }
          );
        }, 1000)
      })
    },
    //change the graph for knowing own location
    async substituteWhy({state} , {oldUrl, newUrl}) {
      return new Promise((resolve) => {
        if (oldUrl == newUrl) {
          resolve()
          return true
        }

        console.log('substituteWhy:');
        console.log(`from ${oldUrl} to ${JSON.stringify(newUrl)}`)

        setTimeout(async () => {
          let stsnew = state.graph.statements.map(st => new $rdf.Statement(st.subject,st.predicate,st.object,newUrl))

          state.graph = new $rdf.graph()
          state.graph.addAll(stsnew)

          resolve()
        })
      })
    },
    async changeLdRessource({state, commit, getters} , {oldUrl, newUrl}) {
       return new Promise((resolve) => {
         if (oldUrl == newUrl) {
           resolve()
           return true
         }

         console.log(`changeLDRessource from: ${oldUrl} to ${newUrl}`)

         setTimeout(() => {
           var processes = getters.allProcesses()

           // Add here all names that need to be changed
           processes.push({
             name: 'budget'
           })
           processes.push({
             name: 'validPeriod'
           })

           // console.log(`changing processes: ${JSON.stringify(processes)}`)

           for (var i = 0; i < processes.length; i++) {
             let stsnew = []
             let encodedProcessName = encodeURI(processes[i].name)
             let oldProcIri = processes[i].ID ? processes[i].ID : $rdf.Namespace(oldUrl + '#')(encodedProcessName)
             let  stsold = state.graph.statementsMatching(oldProcIri)

             // console.log(`changing stmts: ${JSON.stringify(oldProcIri)}`)

             while (stsold.length > 0) {
               // console.log('remove: ' + stsold[0]);
               // console.log(stsold.length);
               stsnew.push(new $rdf.Statement($rdf.Namespace(newUrl + '#')(encodedProcessName), stsold[0].predicate, stsold[0].object))
               state.graph.remove(stsold[0])
             }
             stsold = state.graph.statementsMatching(undefined, undefined, oldProcIri)
             while (stsold.length > 0) {
               // console.log('remove: ' + stsold[0]);
               // console.log(stsold.length);
               stsnew.push(new $rdf.Statement(stsold[0].subject, stsold[0].predicate, $rdf.Namespace(newUrl + '#')(encodedProcessName)))

               state.graph.remove(stsold[0])
             }
             commit('addStatements', stsnew)
           }
           commit('setLdRessource', newUrl)
           // console.log("graph:\n" +state.graph);
           resolve()
         }, 1000)
       })
     },

    changeOwner({state, commit} , {oldOwner, newOwner}) { //change WebId budget is preparedFor

      return new Promise((resolve) => {
        console.log(JSON.stringify(oldOwner));
        console.log(JSON.stringify(newOwner));
        if (oldOwner == newOwner) {
          resolve()
          return true
        }

        setTimeout(() => {
          var stsnew = []
          var stsold = state.graph.statementsMatching(undefined, undefined, $rdf.sym(oldOwner))

          console.log('changeOwner');

          // console.log(JSON.stringify(stsold));
          while (stsold.length > 0) {
            // console.log('remove: ' + stsold[0]);
            // console.log(stsold.length);
            stsnew.push(new $rdf.Statement(stsold[0].subject, stsold[0].predicate, $rdf.sym(newOwner)))

            state.graph.remove(stsold[0])
          }
          // console.log(JSON.stringify(stsnew));
          commit('addStatements', stsnew)


          stsold = state.graph.statementsMatching($rdf.sym(oldOwner), undefined, undefined)

          while (stsold.length > 0) {
            // console.log('remove: ' + stsold[0]);
            // console.log(stsold.length);
            stsnew.push(new $rdf.Statement($rdf.sym(newOwner), stsold[0].predicate, stsold[0].object))

            state.graph.remove(stsold[0])
          }
          // console.log(JSON.stringify(stsnew));
          commit('addStatements', stsnew)
          // console.log("graph:\n" +state.graph);
          resolve()
        }, 1000)

      })
    }


  }
})
