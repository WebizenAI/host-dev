# RWW Apps and Webizen Dev.

## introduction
I've developed this file in parts and have then dumped it all into this readme file...  it may be poorly structured!

There's more related information provided in this [devdocs note](https://devdocs.webizen.org/WebizenTechStack/Webizen2.5/DevNotesWebizen2.5/RWWNotesInfo/).

The Concept of Read-Write-Web was more actively being developed in the early 2010's, with some works developing further as works turned to develop a new system called solid, that built upon the older RWW works.  

There are some PDFs and a video providing a demo of cimba / kima located in this [google drive](https://drive.google.com/drive/folders/1lpeoEFowRcq3VTAp5LH6cFN251O9g9iE) folder. 

The known RWW apps have been copied to the rwwapps folder, to provide a reference for how the older RWW apps functioned.

Webizen apps are loosely based upon the logic demonstrated by the RWW Apps, however there are an array of significant changes. nonetheless, some of the basic concepts are usefully illustrated by way of reviewing these examples. A Description of how they worked and a description of some of the changes is provided below.

## RWW - Reference Web Servers

This folder contains older versions of RWW that were written in golang are being used as a reference for the new libraries / app platform for Webizen. The reference implementations of RWW are in the following folders:

- Gold
- Helix (the dependencies are in the dependencies folder)
- Helix Echo: is located: https://github.com/deiu/helix-echo 
- rwwapps: is located: in the rwwapps folder. A readme file is located (./rwwapps/README.md) containing some information about the rwwapps apps and in-turn also some information about the differences that are sought to be applied via the Webizen works.   This folder also has some solid apps in it, although i am unsure which version of solid they may be designed to work with; i think it depends on the app.  I think the newest app, is the media-kraken-main app.

There are other earlier implementations of RWW and related libraries that are not included in this repository.  These are located in the following repositories:
- https://github.com/MyProfile/ (PHP)
- https://github.com/melvincarvalho/libAuthentication (PHP Authentication Library)
- https://github.com/openlink/virtuoso-opensource (Virtuoso. It must be noted that this is by far the most sophisticated solution that has existed from before the beginning and continues to provide RWW/Solid leadership now, and likely into the future)

For the most-part, RWW has turned into Solid which progressively developed from November 2015 following a 1m gift from Mastercard. as noted [here](https://www.csail.mit.edu/news/web-inventor-tim-berners-lees-next-project-platform-gives-users-control-their-data).

The more recent core libraries include; 

- https://github.com/SolidOS/ 
- https://github.com/CommunitySolidServer/
- https://github.com/solid/
- https://github.com/inrupt/ 
- More info is found: https://github.com/WebCivics/solid-stuff 

There are an array of old 'bits and pieces' that are no longer online.  Indeed the history relating to that problem led to the circumstance where I secured webizen.org for future purposes.  There are many unsung heroes, it is hoped that this work will help to positively recognise some of them via dignified means.  (not necessarily publicly).

There is also related works that were never employed.  One of the biggest examples that i am mindful of is the work done on the concept of [HTTPa](https://github.com/mit-dig/httpa) which whilst not part of RWW in and of itself, was at least in my mind - considered to be 'related'... 


## Old RWW Description

User signed up to a RWW server.  This was generally provided by a 3rd party.

NB: At that stage, LetsEncrypt didn't exist; nor was early versions of it able to issue wildcard certificates.  

Some apps had a RWW AUTH page, that was provided by a separate web-service that listed which servers were available and/or a WebID URI could be provided (sometimes).  There were two primary types of WebID-AUTH the first being WebID-TLS which used a client certificate to authenticate the user, and the second being WebID-OIDC which used an OpenID Connect server to authenticate the user.  The WebID-TLS was the most common, and was used by the majority of the RWW apps.  The WebID-OIDC was used by the RWW apps that were later developed by the Solid team, however the debate about AUTH methods was and is seemingly, on-going.

The WebID-[auth] document contained public key information that was used by the App to authenticate & write / get files. 

The apps were generally hosted somewhere online also.  

There were two distinct groups; people who wanted WebID-OIDC and people who wanted solely WebID-TLS.  Personally i have always wanted both; but also, the way in which these instruments are intended to be used has changed somewhat recently.  Historically I was focused on a 'knowledge banking' (previously called a 'information banking') primary deployment method; this has recently changed as is being illustrated post-covid. 

Fundamentally, most of the early / original apps were able to operate locally in a web-browser without necessarily having a web-server. These sorts of characteristics later changed.  The apps you'll find in the rwwapps folder may work with one of the RWW server examples provided; or alternatively, they may be designed to work with one of the versions of solid. 

Finally also; these systems did not traditionally make use of Credentials / verifiable Claims / Open Badges related works, although a version of credentials (solid-vc) was made for one of the earlier 'solid' implementations; and others have been made since.  

### Concerns and Considerations.

Whilst I'll explain the basic differences below; i figure it might be useful to note some of the concerns and/or differences; noting, that these are not necessarily 'problems' per se, but rather, they are differences that are being addressed by the Solid team in a way that is different to the Webizen works; and that, the Webizen works are not necessarily 'better' or 'worse' than the Solid works; they are just different. Any good / useful ideas implemented by the Solid team are likely to be implemented in the Webizen ecosystem...  and the webizen ecosystem seeks to be exportable to solid in the event a webizen owner is no-longer able to use a webizen server; in addition to, the consideration that it is considered beneficial to seek to ensure interoperability between the two ecosystems.

#### Differences.
The servers were generally intended to be hosted by a 3rd party. More recently this concept has been termed a 'pod provider'.  The underlying implication is that there is still a 'platform provider' who in this case, may be storing alot more of a persons life than is otherwise the case via the array of web 2.0 apps / providers (even if some agents (other than the 'consumer') can integrate / see the entire 'graph'); 

The Apps were in-turn also increasingly designed to be hosted elsewhere; and there is no meaningful way to easily provide confidence that the app is not malicious or that the app isn't consuming the persons data whilst it also presents the information to the end-user.  

These problems are not unique to RWW/solid apps, but is a problem that is inherent to the web and networked applications generally. One of the way to provide confidence via the solid app model, is to provide a way to verify the app. This generally invokes a requirement to create some sort of 'app store'. In any-case, this is a problem that is thought to be amongst the WIP being addressed by the Solid team.

Therein, when an app authenticates against a 'pod' (as they're now called) its somewhat unclear what exactly that app is seeking to obtain from the user.  

Another difference is that i sought to produce a method that employed multiple authentication methods, in a manner that was intended to make distinct what the authentication mechanism was seeking to authenticate.

The next issue or difference is the ontological frameworks.  Many online services (whilst generally unknown to users) employ FOAF, and many more employ Schemaorg. When reviewing the apps, you'll see various namespaces mentioned in them. As solid has advanced it has further developed its ontological framework; however, the webizen works seek to revise how the ontological structures work, which directly impacts the `webid-[auth]` documents.

In-effect, the webizen environment is making an attempt to support the notion of support for a personal ontology; which is made to be distinct to the broader 'social' or 'semantic web' ontologies; which thereby leads to the next issue, which is that HTTP based ontologies are not reliably employable. 

They can sometimes change, or disappear entirely.  In many ways, documents produced with ontologies become ontological instruments themselves also; whilst some of the older RWW systems used WebDAV to support version control; its not always evident.  This combined with the sole use of HTTP leads to concerns about stewardship and reliability of semantics broadly.  Whilst the processing of ontological data may be found to best be done via HTTP and related protocols (Web Sockets, WebRTC, etc); the ontologies and other 'commons' informatics are not necessarily best managed by HTTP.  

These problems are considered inherent to the web and networked applications generally.  Thereafter the works being done via webizen are intended to supply / apply innovative solutions in an ecosystems framework, that seek to address the problems in a unique and otherwise innovative manner.  I am not aware of any other projects that seek to do so similarly. The works are also intended to be exportable to solid in the event a webizen owner is no-longer able to use a webizen server.  Whilst the same sort of consideration could be said for seeking to ensure the ability for users to export their quads & binaries to other platforms; perhaps facebook, or google, or apple, or whatever; it is unlikely that there is a practical means to do so in a way that would be considered useful for the user. 

The Webizen ecosystem is intended to support a fairly comprehensive audit trail; via various temporal interfaces. A great deal of consideration has been given to the notion of `#RealityCheckTech` and the means to both properly identify various form of [Social Attack Vectors](https://devdocs.webizen.org/SocialFactors/SocialAttackVectors/) and in-turn ensure [Safety Protocols](https://devdocs.webizen.org/SocialFactors/WebScience/SafetyProtocols/) are a foundational part of how the ecosystems are designed.  It is considered that any circumstance where a user is expelled in a way that results in no Webizen alliance host wanting to provide them services to support their environment, would only happen in the worst of circumstances; and those circumstances should relate to criminal matters that have a penalty involving imprisonment; noting also, persons who have served their time and are no-longer in prison, should be able to have their webizen environment restored.  Nonetheless, the nature of the environment leads to circumstances where bad actors are much more likely to be identified and successfully prosecuted, than if they were not webizen users; and, In any-case, the webizen works are intended to be exportable to solid in the event a webizen owner decides they want to use a different kind of system and/or is no-longer able to use a webizen server; in addition to, the consideration that it is considered beneficial to seek to ensure interoperability between the two ecosystems, even though there's some functionality that is only able to be provided by the webizen ecosystem.

### Webizen Design differences.

1. Webizen Server Topology
2. Apps
3. Authentication
4. Ontologies
5. AI

NOTE:  I was a little lazy and accepted some of the contributions provided by ChatGPT; although, they're not clearly marked out.  Note also; the notes in: https://devdocs.webizen.org/WebizenTechStack/Webizen2.5/ in particular, is the intended place where the notes about the implementation requirements is sought to be detailed; with the broader devdocs environment built in an effort to explain the broader goals, related considerations / issues and the like.. 

#### Webizen Server Topology

The packages that we're seeking to produce here (/webizenAI generally) are intended to result in the ability for users (webizen owners) to be running a server locally on their device - depending on the type of device.  This is in-turn intended to support Apps that are designed to run locally and authenticate locally and/or to the users local environment.

The environment still primarily makes use of the Web Stack (http(s), WS, WebRTC, etc) but also employs non-http protocols.

There are a few key design factors that are intended to be employed that makes this possible.

1.1 The Requirement for users to have their own domain name.

This is a key design component that provides the capacity to employ DNS to support an array of functionality that is not similarly able to be achieved in circumstances where the concept of end-users owning their own domain names is not employed.  This is a key design factor that therefore provides the ability for users to have better cyber-legal protection, and also provides the ability to provide a more secure and reliable system, through a process that relates to provisioning a users own FQDN (Fully Qualified Domain Name) and then using DNS to provide a range of services. One of those elements is thereafter also, the ability to assign subdomain names to user, devices and other agents; in addition to the ability to employ DNS-SEC and other security related protocols and application related conventions that cannot be achieved if the user (end-user / owner) does not own their own domain name.  

1.2 The use of VPN like technology

In the webizen systems, the systems employ a VPN like system (ATM its WireGuard based) to provide the ability to operate HTTP(s) servers from their client machines / local network with the support of a FQDN: as is generally a requirement.

Presently the designs are intending to use TailScale based systems, which are essentially built upon WireGuard. What this provides is the ability to create a VPN like system that is able to be used to connect to a server that is hosted on the local network.  This is a key design factor, as it allows the server to be hosted on the local network, and the app to be hosted on the local network and/or local machine. 

1.3 Apps

The apps that i'm most focused on producing are those that are designed to run locally on the users machine.  This is a key design factor, as it allows the server to be hosted on the local network, and the app to be hosted on the local network and/or local machine, and are designed to interface solely with the local server.

Some design investigation is sought to be undertaken to understand the feasibility of optionally supporting apps that are constructed to operate solely with a json based API.  Whilst some of the more advanced features require RDF / Semantic Web related (AI) functionality; the basic functionality of apps is to provide a local interface to the local webizen systems; as such, these apps and/or the API method, may be able to be operated without the need for RDF / Semantic Web related (AI) functionality within the app.  

1.4 Authentication

The Authentication systems are designed to be able to operate in a manner that is able to be used to authenticate the user to the local servers that are hosted within their network.  These methods in-turn support the ability to create authenticated relationships with others, via different yet linked authentication methods. 

The Authentication Logic seeks to authenticate against the Domain/network, Device, User, and then the App. In-turn the data that the app is primarily using is the data that is stored on the local webizen server and/or data that the local webizen server requests from the network, and then incorporates into its underlying systems. 

As such; the apps, are merely a front-end.  

1.5 Ontologies

The Webizen systems are experimenting with the production, firstly, of human centric ontologies; which are then also employed for producing sociosphere and biosphere ontologies. There is also a need to define an agent / Webizen agent ontology; noting also, that there is already a significant amount of resources for ontologies relating to things or the employment of concepts as things, and/or similar. The Webizen systems are seeking to produce ontologies that are designed to be used to describe the world as it is, and as it is experienced by the human agent or as is otherwise called the natural agent or observer; as a distinct and vital semantic consideration both for them, and the means through which others seek to rely upon them and the foundational structures defined to support them.

NB: CoPilot suggests this is better communicated in the following way:  'The Webizen systems are also seeking to produce ontologies that are designed to be used to describe the world as it is, and as it is experienced by the natural agent or observer; as a distinct and vital semantic consideration both for them, and the means through which others seek to rely upon them and the foundational structures defined to support them.'

1.6 AI & App services

Apps require various 'server' and/or machine related functionality, beyond the code that is produced for the front-end.  This includes the ability to provide a range of services that are required to support the apps. The Webizen systems works are in-turn defining a services layer to provide support for packages and standardised APIs to those systems to support components required by applications which will include, but are not limited to, the ability to provide a range of AI services, and/or the ability to provide a range of services that are required to support the apps.  

In-turn these libraries are Separate from the Application interfaces (UX) themselves. The webizen agent will in-turn be required to have defined configurations about how particular processes are able to be performed; whether the libraries should be locally available, or whether they should be accessed via a local server, downloaded and installed or accessed via a remote server.  Webizen Apps will require a configuration file that defines what is required to make the app functional. 

The Webizen Client will also be required to have defined configurations about how particular processes are able to be performed; whether the libraries should be locally available, or whether they should be accessed via a local server, downloaded and installed or accessed via a remote server.  Webizen Apps will require a configuration file that defines what is required to make apps functional.  These configurations will change based upon the device being used at the time by the user, and in-turn also what devices are available to the user within their network, etc. 

## WebizenClient & Host WIP

See Documentation on: https://devdocs.webizen.org/ note the [terms](https://devdocs.webizen.org/GuideForDevelopers/)WebizenTerms/ if you can agree to the terms then note: https://devdocs.webizen.org/GuideForDevelopers/ which in-turn contains a sub-note providing information about how to access the discord server.

whilst the documentation can always use more work; I'm doing my best to put the vast majority of docs about this work, into that system (which fwiw; is also on github).


### Useful purpose for providing reference implementations of RWW.

The purpose of providing reference implementations of RWW is that whilst changes are being made, these innovative works demonstrate some of the functionality that was previously made and can be used as a reference to understand some of the old basic concepts; which is in-turn considered helpful for people seeking to understand the new Webizen implementation related concepts.

### Webizen Models

 The Webizen models produce an environment where apps are authenticating against either a local server or a server that is located within a users own network.  Webizen systems also have an authentication server that is located at the root of the users webizen network. The local authentication server is located at: https://localhost/auth which in-turn corresponds also to their domain-name / subdomain. 

## Backwards compatibility

As is otherwise noted; it is important that systems are designed to provide a capacity for people to be able to leave the webizen environment and take their 'data' to a platform that defines what they require in those terms.  This is important for a number of reasons; but the most important is that it is important to ensure that people are not locked into a system that is not able to provide the functionality that they require.  Yet this is considered to be a different problem.

Nonetheless; the primary means through which this objective requirement and/or safety protocol is intended to be achieved relates to the database structure itself.  

## Legal Entities Should Own Their Webizen...
There is also a notion of importance that people own their webizen.  The manifest reality of how this is made technically true; needs to be clearly defined in a way that hasn't been done yet. 

Part of the reason for this is that it needs both; to be implemented with this notion in mind, as well as consequentially described in relation to the implemented method that has been employed to achieve that outcome.  This seems to be an unusual notion when it comes to the web; but it is a notion that is considered to be important.  A person can own a book, without owning the copyright to the work that is encapsulated in the book; there's a nuance there, which needs to be forged into a more clear understanding that is then applied via legal terms that associate with the 'sale' of webizens.

### Limitations of ownership vs. services

Whilst it should be technically feasible for persons to deploy their own webizen, there are an array of currencies and other network functions - particularly surrounding the systems that are defined as 'safety protocols' that may lead to a circumstance that has the consequence of a person not being able to usefully employ their 'webizen', which is the underlying reason for seeking to ensure the backwards compatibility issue is addressed..

This is not unlike the difference between a person owning a motor vehicle vs. having the right to use it on public roads.

#### Social Authentication

Whilst the apps are simply authenticating the local user; the webizen agent is in-turn operating as a social authentication server, that is in-turn employing the information from the local server to retrieve quads from sources via internet. The expectation is; that whilst the WebID (which is largely adopted by the Webizen systems, although renamed) functionality provides an array of capabilities to support social-authentication; the Webizen systems are intended to be able to provide a more secure environment for the authentication process by employing credentials and more specifically therein - values credentials, that seek to associate terms between agents in connection to the authentication process; that in-turn renders the means to engage in 'sharing' / social communications. These terms can also be applied upon public (unauthenticated) users via a similar method, although not in exactly the same way. 

i.e: it becomes like a websites 'terms of service' related statements on a public website / webpage. 

## Other Webizen Dependencies

The WebizenAgent folder is intended to be employed to hack together an initial Webizen agent implementation. 

There are two versions that are required. The first is an implementation that is designed to operate on client machines (ie: laptops / desktop computers - at this stage); the second is an implementation that is intended to be deployed as a hosted service (ie: a web server), most likely in a docker container. This host implementation is also intended to be the basis for producing the installable package that is installed on a device that is intended to be a local webizen host server. 

This sort of device is something that would be plugged into the router (ethernet) locally and be a device that is dedicated to operating the webizen libraries; it would then also act to support the local webizen agents installed on local devices associated to that person and/or family.   In future also, a similar model will apply for businesses, however there will be ontological differences as the device in a business is not intended to represent the personal affairs of a person; rather, it is intended to represent the business affairs of a business, involving persons and other entities related to that business (or community) and the business affairs of that business (or community).

The RWW works are being used as a reference for part of the Webizen implementation, that is intended to be in the WebizenAgent folder.

## RULES

It is important that the source of code be acknowledged in any derivative works. This is important for a number of reasons; but the most important is that it is desirable to seek to ensure that we're able to acknowledge contributors in someway that may be later employed usefully; both, to respect and support the terms upon which the licenses relating to the code are provided, as well as to ensure that the code is not used in a way that is contrary to the terms of the license; and maybe other reasons that are not yet expressly made apparent.

## License

The Webizen project is presently unlicensed for external use in any way.  This situation will change once there's a useful implementation that applies the underlying requirements for the licensing methodology that is intended to be applied.  The terms for development are outlined in the [webizen terms](https://devdocs.webizen.org/GuideForDevelopers/WebizenTerms) document, which basically says, we're developing webizen, all rights are reserved until they're able to be both articulated and pragmatically supported; and that contributions are invited on the basis that persons form the basis upon which they are able to make informed consent to bide by the terms of the [values credentials](https://devdocs.webizen.org/SocialFactors/WebScience/SafetyProtocols/ValuesCredentials/) which is provided as an interim measure. 

This folder also contains an array of different works that have been sourced from various locations and creators who have been involved in producing those works.  Each folder relating to those projects contains within them a README.md file and/or a license.md file that outlines the terms of the license that is associated with that work.  

## Contributing

Provided people have agreed to comply, endorse / support those terms, then they are able to contribute and are invited to join the [webizen discord server](https://devdocs.webizen.org/GuideForDevelopers/WebizenDiscord/) where they can be provided with the necessary information to be able to contribute.