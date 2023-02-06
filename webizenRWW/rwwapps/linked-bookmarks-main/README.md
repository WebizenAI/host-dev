# Linked-Bookmarks

Distributed shared bookmarking using linked data

## Overview

This library provides a frontend for browsing a large number of bookmarks that can be distributed over any number of sites both in terms of where the bookmark collections live and what the bookmarks point to.  Please take a look at the included <a href="http://jeff-zucker.github.io/linked-bookmarks/">Open Culture Browser</a> - an example app that uses linked-bookmarks to display a mashup of tens of thousands of media items from several different sources.

The basic idea is that the bookmarks are arranged using topic trees based on the bookmark ontology's subTopicOf and hasTopic properties.  Any bookmark collection can include any other bookmark collection just by declaring it a subTopic.  For example:
```turtle
  @prefix bk: <http://www.w3.org/2002/01/bookmark#> .

  <https://ME.example.org/animals.ttl#Animals>
    a bk:Topic .
  <https://YOU.example.org/birds.ttl#Birds>
    a bk:topic ;
    bk:subTopicOf <https://ME.example.org/animals.ttl#Animals> .
```
For the user, your tree of Bird bookmarks is now seamlessly a subtree of my Animal bookmarks collection.

## Usage

Copy the files to a local folder and change where the data-component in index.html points to.  Everything else is data driven - create your bookmark turtle files and the browser should just work on them.

## Notes

There, should of course, be tools to save and manage bookmarks to accompany the browser. It will be a while before I have time to make those so if you'd like to create them, please have at it and let me know if you need help.

There should also be semantic tools to search and filter the bookmarks. See <a href="https://solidos.solidcommunity.net/public/2021/01%20Building%20Solid%20Apps%20which%20use%20Public%20Data.html">a related discussion</a>.

&copy; 2020, Jeff Zucker, may be freely used with an MIT open source license