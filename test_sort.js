const arr = Object.freeze([{a:1}, {a:2}]);
const unvisited = [...arr];
unvisited.sort((a, b) => b.a - a.a);
console.log(unvisited);
