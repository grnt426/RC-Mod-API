RC Mod API - RCMA
===========
This is a basic implementation of a modding API that allows mods to register themselves as listeners for events. Those
events are then sent to all mods that were loaded. Data from the event is passed to the mod for it to process if needed.

API
====

`update` - sent whenever the game received an update from the RC server. Things like player updates, navarchs sighted,
 a building finished construction, system explored, etc.

Example Mod
==========
There is an example of what the most basic implementation of a mod that can process the `update` API function provided
inside of `examplemod.js`.

Note, the only lines that CANNOT be changed are the last two at the end. The only exception is the class name,
`MyMod()`, which can be changed to whatever name of the mod is instead.

Future Goals
============

Currently, the API only supports one function, and doesn't allow for clients to perform executions on primitives or data
not exposed through the API. For example, if a mod wanted to change a boolean from true to false, there is no way to
do that without updating `19.js` itself.

Mods must register themselves inside `hookdispatcher.js`, which will be used by everyone that depends on this mod, even
if the user never installs that new mod. While mods that don't exist are ignored on loading, this is still not great
as that means this repository must accept edits to expand the `KNOWN_MODS` array over time.

It would be better if instead mods could be scanned for and loaded only if they actually exist, though without access
to the underlying filesystem this is difficult to do.