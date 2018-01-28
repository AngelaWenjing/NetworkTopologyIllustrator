/**
 * draw the SVG file by information retrieved through the table
 * @param {function}    callback    the callback function
 *      @param {string}     result      the result of SVG saving
 */
var saveSvg = function(callback) {
    // Empty topology
    if ($('tbody').children().length === 0) {
        if (callback) {
            callback('Empty topology');
        } // if (callback)
        return ;
    } // if ($('tbody').children().length === 0)

    // Error message in the table
    if($('#errmsg').length > 0) {
        if (callback) {
            callback('Error in topology');
        } // if (callback)
        return ;
    } // if($('#errmsg'))

    // Real data in the table
    var nodes = {};
    var edges = {};
    $('#tbody').children('tr').each(function() {
        var name = $(this).children().eq(0).text().trim();
        if (name) {
            nodes[name] = [ parseFloat($(this).children().eq(1).text().trim()),
                            parseFloat($(this).children().eq(2).text().trim()) ];
        } // if (name)
        name = $(this).children().eq(3).text().trim();
        if (name) {
            edges[name] = [ $(this).children().eq(4).text().trim(),
                            $(this).children().eq(5).text().trim() ];
        } // if (name)
    }); // $('#tbody').children('tr').each(function() { ... });

    // Now draw the SVG and call back
    createSVG(nodes, edges, $('#text-size').val(),
              $('#node-color').val(), $('#node-size').val(),
              $('#edge-color').val(), $('#edge-width').val(),
              function(result) {
        if (callback) {
            callback(result);
        } // if (callback)
    }); // createSVG(nodes, edges, ... );
}; // var saveSvg = function(callback) { ... };


/**
 * Create the texts for the SVG file
 a @param {array}       nodes       the node list
 * @param {array}       edges       the edge list
 * @param {integer}     fontSize    the size of the font
 * @param {string}      nodeColor   the color of the node
 * @param {integer}     nodeSize    the size of the node
 * @param {string}      edgeColor   the color of the edge
 * @param {integer}     edgeWidth   the width of the edge
 * @param {function}    callback    the callback function
 */
var createSVG = function(nodes, edges,
                         fontSize, nodeColor, nodeSize, edgeColor, edgeWidth,
                         callback) {
    // Normalize the parameters
    fontSize = 4 * (fontSize ? fontSize : 5);
    nodeColor = nodeColor ? nodeColor : '#FFFFFF';
    nodeSize = 8 * (nodeSize ? nodeSize : 5);
    edgeColor = edgeColor ? edgeColor : '#000000';
    edgeWidth = edgeWidth ? edgeWidth : 2;

    // Determine the dimensions
    var left = Number.POSITIVE_INFINITY;
    var top = Number.POSITIVE_INFINITY;
    var right = -1;
    var bottom = -1;
    Object.values(nodes).forEach(function(node) {
        left = left < node[0] ? left : node[0];
        top = top < node[1] ? top : node[1];
        right = right > node[0] ? right : node[0];
        bottom = bottom > node[1] ? bottom : node[1];
    }); // Object.values(nodes).forEach(function(node) { ... });
    var mgX = Math.round((right - left) * 0.1);
    var mgY = Math.round((bottom - top) * 0.1);
    var width = right - left;
    var height = bottom - top;

    // Produce the SVG
    var text = '';
    //      header
    text += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' +
            (width + 2 * mgX) + '" height="' + (height + 2 * mgY) + '">\n';
    //      border background
    text += '  <rect  id="outer" class="border" width="' +
            (width + 2 * mgX) + '" height="' + (height + 2 * mgY) + '" />\n';
    //     flip Y axis because it goes downwards in screen coordinate system
    text += '  <g transform="translate(' + (mgX - left) + ', ' +(mgY + bottom) +
            ') scale(1, -1)">\n';
    //     border line
    text += '    <rect id="inner" class="border" x="' + left +'" y="' + top +
            '" width="' + width + 'd" height="' + height + '" />\n\n';
    //     edges are lines
    Object.keys(edges).forEach(function(k) {
        var o = edges[k][0];
        var d = edges[k][1];
        text += '    <line id="' + k +'" x1="' + nodes[o][0] +
                '" y1="' + nodes[o][1] + '" x2="' + nodes[d][0] +
                '" y2="' + nodes[d][1] + '" />\n';
    }); // Object.keys(edges).forEach(function(k) { ... });
    //     nodes are circles
    Object.keys(nodes).forEach(function(k) {
        text += '    <circle id="' + k + '" cx="' + nodes[k][0] +
                '" cy="' + nodes[k][1] + '" r="' + Math.round(nodeSize / 2.0) +
                '" />\n';
    }); // Object.keys(edges).forEach(function(k) { ... });
    text += '\n';

    //      draw extra informations if require
    if (fontSize) {
        //      span texts - the transforms are to flip texts back
        //      after the above Y-axis flip
        Object.keys(edges).forEach(function(k) {
            var o = edges[k][0];
            var d = edges[k][1];
            var x = Math.abs((nodes[o][0] + nodes[d][0]) / 2.0);
            var y = Math.abs((nodes[o][1] + nodes[d][1]) / 2.0);
            text += '    <g transform="translate(0, ' + (y * 2) +
                    ') scale(1, -1)">\n';
            // text += '      <rect id="' + (k + '-txt-rect') +
            //         '" class= "edges" x="' + x + '" y="' + y +
            //         '" width="' + fontSize + '" height="' + fontSize + '" />\n'
            text += '        <text id="' + (k + '-txt') + '" x="' + x +
                    '" y="' + y + '">' + k + '</text>\n';
            text +=  '    </g>\n';
        }); // Object.keys(edges).forEach(function(k) { ... });
        text += '\n';
        //      node text - they go on top of span texts if overlapped
        Object.keys(nodes).forEach(function(k) {
            text += '    <text id="' + (k + '-text') + '" x="' + nodes[k][0] +
                    '" y="' + (nodes[k][1] + 2) + '" transform="translate(0, ' +
                    (nodes[k][1] * 2) +') scale(1, -1)">' + k + '</text>\n';
        }); // Object.keys(edges).forEach(function(k) { ... });
    } // if (fontSize)
    //      this script makes some decorations, put on colors and to move each
    //      text to the center of its node/edge
    text += `
    </g>\n
    <style>
      text          { font-size:` + fontSize + `px; }
      line, circle  { stroke:` + edgeColor + `; stroke-width:` + edgeWidth + `px; }
      circle, rect  { fill:` + nodeColor + `; }
      rect.border   {
        stroke:` + edgeColor + `;
        stroke-width:1;
        stroke-dasharray:5 5;
        display:none;
      }
    </style>
    <script><![CDATA[
    var texts = document.getElementsByTagName('text');
    var edges = document.getElementsByClassName('edges');
    for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        var bbox = text.getBBox();
        text.setAttribute('x', parseInt(text.getAttribute('x')) - Math.floor(bbox.width / 2));
        text.setAttribute('y', parseInt(text.getAttribute('y')) + Math.floor(bbox.height / 4));
        if (i < edges.length) {
        var span = edges[i];
        span.setAttribute('x', parseInt(text.getAttribute('x')));
        span.setAttribute('y', parseInt(text.getAttribute('y')) - (Math.floor(bbox.height * 2 / 3) + 2));
        span.setAttribute('width', bbox.width);
        span.setAttribute('height', bbox.height);
        } // if (i < edges.length)
    } // for (var i = 0; i < texts.length; i++)
    ]]></script>`;
    text += '\n</svg>\n';

    chrome.downloads.download({
        url:            'data:text/html,'+text,
        filename:       Object.keys(nodes).length + 'n' +
                        Object.keys(edges).length + 'e.svg',
        conflictAction: 'uniquify'
    }, function (downloadId) {
        if (callback) {
            callback(downloadId ? 'Done' : 'Error when saving SVG!!!')
        } // if (callback)
    }); // chrome.downloads.download({ ... }, function (downloadId) { ... });
}; // var createSVG = function(nodes, edges) { ... };
