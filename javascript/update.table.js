/**
 * Update table by parsing text in the text area
 */
var updateTable = function() {
    var nodes = [];
    var edges = [];
    var errmsg = null;

    // Parse texts into nodes and edges
    var cur = null;
    var keys = null;
    var texts = $('#text').val().trim().split('\n').map( (e)=>e.trim() );
    texts.forEach(function(e, i, arr) {
        if (e.startsWith('#') || e === '') {                    // comment/empty line
            return ;
        } else if (/^node\s+x\s+y/g.test(e.toLowerCase())) {    // "NODE X Y ..."
            cur = nodes;
        } else if (/^((edge)|(span))\s+o\s+d/g.test(e.toLowerCase())) {    // "EDGE O D ..."
            cur = edges;
            if (nodes.length === 0) {
                errmsg = 'edges before nodes';
                return ;
            } // if (nodes.length === 0)
            keys = nodes.map( (n)=>n[0]);
        } else {                                                // real information
            var values = e.split(/\s+/g).slice(0, 3).map( (e)=>e.trim() );
            if (cur === nodes) {                // now in node rows
                if (isNaN(values[1])) {
                    errmsg = 'invalid node[x]: ' + values[1] + '; number expected';
                } else if (isNaN(values[2])) {
                    errmsg = 'invalid node[y]: ' + values[2] + '; number expected';
                } // if ... else if ...
                cur.push([ values[0], parseFloat(values[1]), parseFloat(values[2]) ]);
            } else if (cur === edges) {         // now in edge rows
                if (keys.findIndex( (k)=>k===values[1]) < 0) {
                    errmsg = 'invalid edge[o]: ' + values[1] + ' not exist';
                } else if (keys.findIndex( (k)=>k===values[2]) < 0) {
                    errmsg = 'invalid edge[d]: ' + values[2] + ' not exist';
                } // if ... else if ...
                cur.push(values);
            } else {                            // other information
                if (!cur) {
                    errmsg = 'unkown error';
                } // if (!cur)
            } // if ... else if ... else ...
        } // if ... else if ... else ...
    }); // texts.forEach(function(e, i, arr) { ... });

    // Update table
    $('#tbody').empty();
    // error happened
    if (errmsg) {
        var tr = $('<tr></tr>');
        tr.append($('<td></td>').attr('id', 'errmsg').attr('colspan', '6')
          .attr('style', 'color:red').text(errmsg));
        $('#tbody').append(tr);
        return ;
    } // if (errmsg)
    // no errors
    var length = nodes.length > edges.length ? nodes.length : edges.length;
    for (var i = 0; i < length; i++) {
        var tr = $('<tr></tr>');
        tr.append($('<td></td>').text(nodes[i] ? nodes[i][0] : ''));
        tr.append($('<td></td>').text(nodes[i] ? nodes[i][1] : ''));
        tr.append($('<td></td>').text(nodes[i] ? nodes[i][2] : ''));
        tr.append($('<td></td>').text(edges[i] ? edges[i][0] : ''));
        tr.append($('<td></td>').text(edges[i] ? edges[i][1] : ''));
        tr.append($('<td></td>').text(edges[i] ? edges[i][2] : ''));
        $('#tbody').append(tr);
    } // for (var i = 0; i < length; i++)
}; // var updateTable = function() { ... };
