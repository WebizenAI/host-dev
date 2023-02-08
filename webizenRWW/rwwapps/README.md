# RWW Apps and Webizen Dev.

## introduction
I've developed this file in parts and have then dumped it all into this readme file...  it may be poorly structured!

The Concept of Read-Write-Web was more actively being developed in the early 2010's, with some works developing further as works turned to develop a new system called solid, that built upon the older RWW works.  

There are some PDFs and a video providing a demo of cimba / kima located in this [google drive](https://drive.google.com/drive/folders/1lpeoEFowRcq3VTAp5LH6cFN251O9g9iE) folder. 

The known RWW apps have been copied to the rwwapps folder, to provide a reference for how the older RWW apps functioned.

Webizen apps are loosely based upon the logic demonstrated by the RWW Apps, however there are an array of significant changes. nonetheless, some of the basic concepts are usefully illustrated by way of reviewing these examples. A Description of how they worked and a description of some of the changes is provided below.

## RWW - Reference Apps

a range of rwwapps apps are provided in this folder. I think the folder also has some solid apps in it, although i am unsure which version of solid they may be designed to work with; i think it depends on the app.  I think the newest app, is the media-kraken-main app. 

Generally speaking, they follow a similar pattern whereby they're designed to authenticate against a webid (either tls or oidc) to a RWW or Solid server location.  Often the code for this function is hard-coded; and the server / web-address that it relies upon, is no longer available. This can be resolved by finding the authorisation end-point for one of the RWW (or solid) servers that are provided and modifying that line of code.

This folder contains older versions of RWW (and/or Solid) apps: here's a list of them,

- chat: is a chat app that was developed by the RWW team. (tested - it worked)
- clip: is a clipboard app (untested)
- doap: is description of a project app (it worked)
- schedule: is a scheduling app for creating a meeting (untested
- errol: is a webid manager (untested)
- Explorer: is a file explorer (untested)
- Friend-Crawler: is a friend crawler (untested)
- GroupURIs: is a group uri app (untested) (to create group pods afaik)
- Health: is a health app (untested)
- Ld-Cal: is a calendar app (untested)
- Linked bookmarks: is a bookmark app (untested)
- media-karken: is a media app it queries the IMDB systems and seemingly works recently. (tested - it worked)
- Microblog: Contains two version, 
  - Cimba: is a microblog app (used long-ago with the old GOLD server)
  - Kima: an alternative to demonstrate how the apps were independent - also worked with the old GOLD server.
- midichlorians: is a newer solid app - although not entirely sure what it does other than demonstrate a tech concept.
- pad: a note pad app (untested)
- Poll: a poll app (untested)
- Rabel: says its a linked-data converter (i imagine between serialisations) (untested)
- video: a small video app to play videos.
- Timeline: a facebook like timeline app
- Spreadsheet: a spreadsheet app.
- Solid Apps:
  - Content Manager: 
  - Focus:
  - Plume
  - Verifiable Credentials (vc)
  - Base: a budgeting app.

There is also related works that were never employed.  One of the biggest examples that i am mindful of is the work done on the concept of [HTTPa](https://github.com/mit-dig/httpa) which whilst not part of RWW in and of itself, was at least in my mind - considered to be 'related'... 

## WEBIZEN MODS

1. AUTH
   The AUTH logic uses FOAF; this is expected to change. 
   The focus with Webizen Apps is for them to run locally rather via a 3rd party service. This may include being installed within a webizen owners network, that therefore allows them to use the app on multiple devices

2. Ontology
    As noted, the auth logic currently uses FOAF; which is one of the many broader ontology related changes.

3. Interface
   Presently the apps are generally designed to use RDF as the primary data format. Investigation into whether and/or how apps might be defined to use json with the local webizen service is under consideration.  This would in-turn require the webizen service to then make the RDF calls as required; which is in-part achieved via the RDF services built into the webizen service itself.  Considerations about this change would seek to have the following effects;
   - the apps would be required to use the local end-point rather than being able to use external services.
   - the apps may be easier for app developers to produce - given they're not required to understand RDF.
   - the auth logic would reside with the webizen service, and the method may enhance security logic.
   - other parts of the ecosystem also use json.  therefore the change may be more consistent with the rest of the app ecosystem.

## RULES

It is important that the source of code be acknowledged in any derivative works. This is important for a number of reasons; but the most important is that it is desirable to seek to ensure that we're able to acknowledge contributors in someway that may be later employed usefully; both, to respect and support the terms upon which the licenses relating to the code are provided, as well as to ensure that the code is not used in a way that is contrary to the terms of the license; and maybe other reasons that are not yet expressly made apparent.

## License

The Webizen project is presently unlicensed for external use in any way, fundamentally there's not much useful stuff that's been made. When this situation changes, once there's a useful implementation that applies the underlying requirements for the licensing methodology that is intended to be applied.  The terms for development are outlined in the [webizen terms](https://devdocs.webizen.org/GuideForDevelopers/WebizenTerms) document, which basically says, we're developing webizen, all rights are reserved until they're able to be both articulated and pragmatically supported; and that contributions are invited on the basis that persons form the basis upon which they are able to make informed consent to bide by the terms of the [values credentials](https://devdocs.webizen.org/SocialFactors/WebScience/SafetyProtocols/ValuesCredentials/) which is provided as an interim measure. 

This folder also contains an array of different works that have been sourced from various locations and creators who have been involved in producing those works.  Each folder relating to those projects contains within them a README.md file and/or a license.md file that outlines the terms of the license that is associated with that work.  

## Contributing

Provided people have agreed to comply, endorse / support those terms, then they are able to contribute and are invited to join the [webizen discord server](https://devdocs.webizen.org/GuideForDevelopers/WebizenDiscord/) where they can be provided with the necessary information to be able to contribute.