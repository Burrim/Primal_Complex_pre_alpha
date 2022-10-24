export default function loadMap(scene, key) {
    scene.load.tilemapTiledJSON(key, files.maps[key] ); //Bereitet das laden der mapdaten vor
    scene.load.once('complete', () => //Setzt eine Callback Funktion auf für sobald die Mapdaten geladen wurden
    {
        //Creates Tilemap and other related objects
        scene.map = {
            name : key,
            core : scene.make.tilemap({key: key}), //Tilemap Object
            layers: [],
            tilesets : [],
            objects: files.maps[key].objects,
        }
        //Creates Tileset Objects
        files.maps[key].tilesetKeys.forEach(setKey =>{
            scene.map.tilesets.push(scene.map.core.addTilesetImage(setKey, setKey))
        })

        //Creates Layers
        files.maps[key].layers.forEach((layerData,index) =>{
            let layer = scene.map.core.createLayer(layerData.name, scene.map.tilesets, 0, 0).setVisible(true).setPipeline('Light2D').setDepth(-1);
            if(layer.layer.name[0] == 'a') layer.setDepth(3) //Puts Above layers in the foreground
            scene.map.layers.push(layer)
            if(index == 0) scene.map.meta = layer
        })

        //Sets Tile attributes for meta layer
        let metaData = files.maps[key].layers[0].tileData
        let colissionPool = []
        scene.map.meta.forEachTile((tile,index) => {

          if(metaData[index].colission){
            colissionPool.push(index)
            tile.collideUp = true
            tile.collideLeft = true
            tile.collideRight = true
            tile.collideDown = true
          }

          if(metaData[index].passDown){
            tile.collideLeft = false
            tile.collideRight = false
            tile.collideDown = false
            tile.properties.passDown = true
          }
        })
        scene.map.core.setCollision(colissionPool,true,true,scene.map.meta)
    }) 

scene.load.start(); //Startet den ladevorgang

Audio.playBGM(files.maps[key].music)
}