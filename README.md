RC Mod API - RCMA
===========
This is a basic implementation of a modding API that allows mods to register themselves as listeners for events. Those
events are then sent to all mods that were loaded. Data from the event is passed to the mod for it to process if needed.

API
====

`update(data)` - sent whenever the game received an update from the RC server. Things like player updates, navarchs sighted,
 a building finished construction, system explored, etc.

The input is a sometimes large JSON. All of them follow this basic format,
```json
{
 "type":"incr_update",
 "instance":2762,
 "data":
  {
   "player_notifs":
    [
     {
      "data":{},
      "key":"",
      "type":"text",
      "timestamp":1652028161478
     }
    ]
  }
}
```

The mod will automatically create the outer field `type`, which defines the payload sent as an incremental update. For 
this API, it will always be `incr_update`. `instance` is the instance ID of the game and is unique for each game. `data`
is what the game actually sent to the client and is stuffed into this field. All the fields within `data` will vary
depending on what kind of event was sent, but most of them seem to have a `data` field, `type`, and `timestamp`. 

Examples of inputs from real games are below.

Another player bought your offer:
```json
{"type":"incr_update","data":{"player_notifs":[{"data":{"buyer":"PlayerUsername","offer_id":4802},"key":"offer_sold","system_id":null,"type":"text","id":0,"timestamp":1652028161478}]},"instance":2762}
```

One of your agents started infiltrating:
```json
{"type":"incr_update","data":{"player_notifs":[{"data":{"spy":"Minae Leytan","system":"Alnafis"},"key":"infiltration_started","system_id":390,"type":"text","id":0,"timestamp":1649259148656}]},"instance":2713}
```

A player explores a system for the first time:
```json
{"type":"incr_update","data":{"faction_faction_contact":{"contact":{"details":{"explorer":[{"reason":"PlayerUsername","value":1}]},"minimum":[],"value":1},"system_id":486,"receivedAt":1648730186741}},"instance":2713}
```

Sector and system taken
```json
{"type":"incr_update","data":{"global_galaxy_sector":[{"adjacent":[2,3],"centroid":[14.436,12.453],"division":[{"faction":null,"points":4}],"id":0,"name":"Atyoku","owner":"synelle","points":[[18,20],[23,15],[22,12],[17,9],[13,4],[8,8],[6,13],[14,18],[18,20]],"victory_points":1},{"adjacent":[4,5],"centroid":[68.
 883,65.969],"division":[{"faction":null,"points":2},{"faction":"myrmezir","points":1}],"id":1,"name":"Margavak","owner":"myrmezir","points":[[77,68],[76,65],[73,61],[66,58],[62,63],[63,69],[63,71],[69,73],[71,73],[77,68]],"victory_points":1},{"adjacent":[0,6,9],"centroid":[25.644,30.469],"division":[{"faction":
null,"points":1}],"id":2,"name":"Dor-Alnara","owner":null,"points":[[27,29],[21,24],[19,22],[18,20],[14,18],[15,21],[17,27],[20,29],[26,33],[27,37],[33,39],[35,40],[38,38],[34,34],[27,29]],"victory_points":1},{"adjacent":[0,6,7],"centroid":[28.892,17.414],"division":[],"id":3,"name":"Byukan","owner":null,"point
 s":[[29,12],[22,12],[23,15],[26,20],[28,22],[32,23],[35,21],[37,18],[31,17],[29,12]],"victory_points":1},{"adjacent":[1,7,8],"centroid":[67.527,48.525],"division":[{"faction":"myrmezir","points":1}],"id":4,"name":"Tyaniroi","owner":"myrmezir","points":[[63,43],[66,46],[66,53],[66,58],[73,61],[74,56],[73,50],[71
,44],[66,40],[61,38],[56,32],[58,39],[63,43]],"victory_points":1},{"adjacent":[1,8,9],"centroid":[56.091,64.514],"division":[{"faction":"myrmezir","points":2},{"faction":null,"points":1}],"id":5,"name":"Asharia","owner":"myrmezir","points":[[59,69],[63,69],[62,63],[59,61],[50,59],[50,62],[51,68],[59,69]],"victo
 ry_points":1},{"adjacent":[2,3,7,9],"centroid":[34.965,29.316],"division":[],"id":6,"name":"Lum Hen","owner":null,"points":[[35,21],[32,23],[31,26],[34,34],[38,38],[39,35],[37,29],[35,21]],"victory_points":2},{"adjacent":[3,4,6],"centroid":[44.781,28.53],"division":[{"faction":null,"points":2}],"id":7,"name":"M
 agoth","owner":null,"points":[[58,39],[56,32],[52,27],[49,29],[45,26],[44,25],[40,19],[37,18],[35,21],[37,29],[43,34],[49,35],[51,32],[54,36],[58,39]],"victory_points":1},{"adjacent":[4,5,9],"centroid":[57.379,52.478],"division":[{"faction":null,"points":2}],"id":8,"name":"Covaris","owner":null,"points":[[59,61
],[59,59],[59,52],[61,53],[66,46],[63,43],[60,46],[55,48],[51,54],[50,59],[59,61]],"victory_points":2},{"adjacent":[2,5,6,8],"centroid":[42.484,49.593],"division":[{"faction":null,"points":2}],"id":9,"name":"Senteya","owner":null,"points":[[40,54],[42,55],[45,56],[49,63],[51,68],[50,62],[50,59],[51,54],[45,53],
 [44,46],[45,44],[38,38],[35,40],[36,46],[40,54]],"victory_points":1}]},"instance":2705}
```

Mod Format
===========
The entry point for a mod must end its filename with `mod.js`. That will be scanned for and automatically loaded.

All mods must, after their class definition, include this line to register themselves as a listener.

```js
window.granite.mods.hooks.push(new MyModClassName());
```

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

It would be better if instead mods could be scanned for and loaded only if they actually exist, though without access
to the underlying filesystem this is difficult to do.