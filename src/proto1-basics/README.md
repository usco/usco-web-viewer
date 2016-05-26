##We need to be able to

- displays meshes, from raw hashes of Float32Array (positions, normals) => DONE
- display meshes given lots of 'meta' data : ie json object containing transforms, colors, etc IN , render OUT => DONE
- have identical controls (camera controls) *MEDIUM* => DONE
- replicate (need not match 100%) object transform controls  *VERY HARD*
- replicate (need not match 100%) the 'grid' *MEDIUM*
- do 'picking' *MEDIUM*
- work server side  *EASY* => DONE, IN COLOR
- object outlines (hopefully BETTER than the current ones) *HARD*
- lines (for gcode etc) *TRIVIAL* : just use primitive:'lines' when rendering => DONE
- shadows (less important, waaay harder than all the rest ?) *VERY HARD*
- shading /visual quality *MEDIUM*  
- what to do with all 'visual helpers' ? *HARD*

##Cool extras and tools:
- good performance
- fantastic readeability
- no more hacks
- functional
- data driven
- close to the metal : no more going through hoops (three.js)
- makes it easier to implement advanced rendering (npr, pbr)
- small size
- part of the stack-gl ecosystem (somewhat)

##Cool tools in stack-gl for use
- reindex geometric data to keep hard edges while keeping advantage of indexed geometry: see http://stack.gl/packages/#hughsk/mesh-reindex
- center mesh http://stack.gl/packages/#wwwtyro/geo-center
- ambient occlusion ?http://wwwtyro.github.io/geo-ambient-occlusion/example/