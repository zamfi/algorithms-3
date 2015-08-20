function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function wrapFunction(f) {
  return new Sk.builtin.func(function() {
    return Sk.ffi.remapToPy(f.apply(f, Array.prototype.map.call(arguments, function(arg) { return Sk.ffi.remapToJs(arg); })));
  });
}

function getHeuristicFromPython(code, output_f, globals) { 
   var mypre = document.getElementById("output"); 

   Sk.pre = "output";
   Sk.configure({output:output_f, read:builtinRead}); 
   
   var mod = Sk.importMainWithBody("<stdin>", false, code, false);
   for (var k in globals) {
     if (globals.hasOwnProperty(k)) {
       mod.$d[k] = typeof(globals[k]) == 'function' ? wrapFunction(globals[k]) : Sk.ffi.remapToPy(globals[k]);
     }
   }

   return function(next, from, to, path) {
     return Sk.ffi.remapToJs(Sk.misceval.call(mod.$d.heuristic, null, null, null, 
       Sk.ffi.remapToPy(next),
       Sk.ffi.remapToPy(from),
       Sk.ffi.remapToPy(to),
       Sk.ffi.remapToPy(path) // remapToPy is recursive
     ));
   }
} 