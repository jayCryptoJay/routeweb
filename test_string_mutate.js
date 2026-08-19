"use strict";
const str = "hello";
try { str.prop = 1; } catch (e) { console.log(e.message); }
