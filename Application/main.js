function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();
    var interpolationFlag = false;
    var cmapFlag = false;
    var reflectionFlag = 0;
    var isovalue = 128;

    screen.init( volume, {
        width: window.innerWidth,
        height: window.innerHeight,
        enableAutoResize: false
    });

    // Create color map
    var cmap1 = []; // rainbow color
    var cmap2 = []; // single color
    for ( var i = 0; i < 256; i++ )
    {
        var S = i / 255.0; // [0,1]
        var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
        var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
        var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
        var color = new THREE.Color( R, G, B );
        cmap1.push( [ S, '0x' + color.getHexString() ] );
    }
    for ( var i = 0; i < 256; i++ )
    {
        var S = i / 255.0; // [0,1]
        var R = 1;
        var G = Math.max( -S + 1, 0.0 ); // liner
        var B = Math.max( -S + 1, 0.0 );
        var color = new THREE.Color( R, G, B );
        cmap2.push( [ S, '0x' + color.getHexString() ] );
    }

    var cmap = cmap1;

    // GUI setting
    var FizzyText = function() {
      this.isovalue = isovalue;
      this.reflection = reflectionFlag;
      this.interpolation = interpolationFlag;
      this.colorMap = cmapFlag;
    };
    var text = new FizzyText();
    var gui = new dat.GUI();
    var isoController = gui.add(text, 'isovalue', 0, 255);
    var reflectionController = gui.add(text, 'reflection', { Lambertian: 0, Phong: 1, BlinnPhong: 2 } );
    var interpolationController = gui.add(text, 'interpolation');
    var colorMapController = gui.add(text, 'colorMap');
 
    function getColorbar(cmap){
        var lut = new THREE.Lut( 'rainbow', cmap.length );
        lut.addColorMap( 'mycolormap', cmap );
        lut.changeColorMap( 'mycolormap' );
        return lut.setLegendOn( {
            'layout':'horizontal',
            'position': { 'x': 25, 'y': 5, 'z': 0 },
            'dimensions': { 'width': 10, 'height': 50 }
        });
    }

    var colorbar = getColorbar(cmap);
    screen.scene.add( colorbar );

    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    var surfaces = Isosurfaces( volume, isovalue, interpolationFlag, reflectionFlag, cmap);
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    isoController.onFinishChange(function(value) {
        screen.scene.remove( surfaces );
        isovalue = Math.round(value);
        surfaces = Isosurfaces( volume, isovalue, interpolationFlag, reflectionFlag, cmap);
        screen.scene.add( surfaces );
    });

    reflectionController.onFinishChange(function(value) {
        screen.scene.remove( surfaces );
        reflectionFlag = value;
        surfaces = Isosurfaces( volume, isovalue, interpolationFlag, reflectionFlag, cmap);
        screen.scene.add( surfaces );
    });

    interpolationController.onFinishChange(function(value) {
        screen.scene.remove(surfaces);
        interpolationFlag = value;
        surfaces = Isosurfaces( volume, isovalue, interpolationFlag, reflectionFlag, cmap);
        screen.scene.add( surfaces );
    });

    colorMapController.onFinishChange(function(value) {
        screen.scene.remove(surfaces);
        screen.scene.remove(colorbar);
        cmapFlag = value;
        if(cmapFlag == false){cmap = cmap1;}
        else {cmap = cmap2;}
        surfaces = Isosurfaces( volume, isovalue, interpolationFlag, reflectionFlag, cmap);
        colorbar = getColorbar(cmap);
        screen.scene.add( colorbar );
        screen.scene.add( surfaces );
    });

    screen.loop();
}
