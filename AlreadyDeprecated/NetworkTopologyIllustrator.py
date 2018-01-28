#!/usr/bin/env python2
# -*- coding: utf-8 -*-


'''
Read topology from a "*.top" file (textual), and draw it to SVG.
The "*.top" file is like:

    # 150n375s.top
    NODE	X	Y
    N001	478.00	5.00
    N002	376.00	8.00
    N003	134.00	9.00
    # ... ...
    SPAN	O	D	LENGTH	MTTF(h)	MTTR(h)	UA
    S001	N001	N002	102.0441	28634.6763	12	0.0004
    S002	N001	N007	82.3772	35470.9879	12	0.0003
    S003	N001	N009	54.4059	53707.4281	12	0.0002
    # ... ...

Note there might be **extra fields except X/Y of nodes and O/D of spans**.


@author:  AngelaWenjing
@version: 1.0.0
'''
import os, sys, math, networkx as nx


def nxgFromTopFile(filename):
    '''
    Read the topology file and generates network graph
    @param filename: {String}         the topology file
    @return:         {networkx.Graph} the graph
    '''
    G = nx.Graph()
    startNode, startSpan = False, False
    # Node parameters
    hasNodeSize = False
    # Span parameters
    idxSpanLength, idxSpanMTBF, idxSpanMTTR, idxSpanFixedCost = -1, -1, -1, -1

    # Read the file and assembly the network graph
    f = open(filename, 'r')
    nodes = []      # this is for later storation of all nodes
    for line in f:
        line = line.strip()
        cols = line.split()
        if len(line) == 0 or line.startswith('#'):      # empty line or comments
            continue
        elif line.startswith('NODE'):                   # following are nodes
            startNode = True
            startSpan = False
            if ('SIZE' in [x.upper() for x in cols]):       # detect extra fields
                hasNodeSize = True
        elif line.startswith('SPAN'):                   # following are spans
            startSpan = True
            startNode = False
            for i, col in enumerate(cols):                  # detect extra fileds
                if 'LENGTH' == col.upper():
                    idxSpanLength = i
                elif 'MTBF' == col.upper():
                    idxSpanMTBF = i
                elif 'MTTR' == col.upper():
                    idxSpanMTTR = i
                elif 'FIXEDCOST' == col.upper():
                    idxSpanFixedCost = i
            pass # for i, col in enumerate(cols)
        else:                                           # real information
            if startNode:
                G.add_node(cols[0], x=float(cols[1]), y=float(cols[2]), \
                           size=None if not hasNodeSize else float(cols[3]))
            elif startSpan:
                # Nodes always comes ealier than spans, so now all nodes are ready
                assert G.has_node(cols[1]) and G.has_node(cols[2])
                if len(nodes) == 0: # store all the nodes
                    for i, n in enumerate(G.nodes(data=True)):
                        node = n[-1]
                        node['name'] = n[0]
                        nodes.append(node)
                    pass # for i, n in enumerate(G.nodes(data=True))
                pass # if len(nodes) == 0
                origin, dest = None, None
                for node in nodes:
                    if node['name'] == cols[1]:
                        origin = node
                    elif node['name'] == cols[2]:
                        dest = node
                pass # for - if - else
                assert origin is not None and dest is not None
                G.add_edge(cols[1], cols[2], name=cols[0], unitCost = float(cols[-1]), \
                           length=math.sqrt((origin['x'] - dest['x'])**2 + (origin['x'] - dest['x'])**2) \
                                  if idxSpanLength < 0 else float(cols[idxSpanLength]), \
                           mtbf=None if idxSpanMTBF <0 else float(cols[idxSpanMTBF]), \
                           mttr=None if idxSpanMTTR < 0 else float(cols[idxSpanMTTR]), \
                           fixedCost=None if idxSpanFixedCost < 0 else float(cols[idxSpanFixedCost]))
            pass # elif  - ifstartNode
        pass # else - elif - elif - if len(line) == 0 or line.startswith('#')
    pass # for line in f
    f.close()
    return G
pass # def nxgFromTopFile(filename)


def drawGraphSVG(graph, svgFile, **params):
    '''
    Draw the graph into a SVG figure
    @param graph:   {networkx.Graph} the graph to be drawn
    @param svgFile: {string}         path of the SVG file
    @param params:  {dictionary}     figure styles
             withTexts:    {boolean}    output names of nodes and spans. Default as True
             strokeColor:  {string}     color of strokes. Default as black
             strokeWidth:  {int}        width of strokes. Default as 2
             fillColor:    {string}     color of shape fillings. Default as white
             circleRadius: {int}        radius of the node circles. Default as 10
             fontSize:     {int}        font size. Default same as circleRadius-4
    '''
    # Prepare nodes and spans
    nodes = []
    for i, n in enumerate(graph.nodes(data=True)):
        node = n[-1]
        node['name'] = n[0]
        nodes.append(node)
    pass # for i, n in enumerate(graph.nodes(data=True))
    if len(nodes) == 1:                                 # don't draw single-node-graph
        return
    pass # if len(nodes) == 1
    spans = []
    for i, s in enumerate(graph.edges()):
        span = graph[s[0]][s[1]]
        for node in nodes:
            if node['name'] == s[0]:
                span['origin'] = node
            elif node['name'] == s[1]:
                span['dest'] = node
        pass # for - if - else
        spans.append(span)
    pass # for i, s in enumerate(graph.edges())

    # SVG parameters
    if not svgFile.lower().endswith('.svg'):
        svgFile.append('.svg')
    withTexts = params.get('withTexts') if params.get('withTexts') is not None else True
    strokeColor = params.get('strokeColor') if params.get('strokeColor') is not None else 'black'
    strokeWidth = params.get('strokeWidth') if params.get('strokeWidth') is not None else 2
    fillColor = params.get('fillColor') if params.get('fillColor') is not None else 'white'
    circleRadius = params.get('circleRadius')
    if circleRadius is None or type(circleRadius).__name__ != 'int' or circleRadius <= 0:
        circleRadius = 10
    pass # if circleRadius ...
    fontSize = params.get('fontSize')
    if fontSize is not None or type(fontSize).__name__ != 'int' or fontSize <= 0 or fontSize >= circleRadius * 2:
        fontSize = circleRadius - 2
    pass # if fontSize ...

    # Temporary parameters useful for calculating objects' positions
    left, top, right, bottom = sys.maxint, sys.maxint, 0, 0
    for node in nodes:
        if node['x'] < left:           left = node['x']
        if node['x'] > right:          right = node['x']
        if node['y'] < top:            top = node['y']
        if node['y'] > bottom:         bottom = node['y']
    pass # for node in nodes
    mgX, mgY = (right - left) / 10, (bottom - top) / 10
    width, height = right - left, bottom - top

    # Draw the SVG
    f = open(svgFile, 'w')
    #   header
    f.write('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="%d" height="%d">\n' \
              % (width + 2 * mgX, height + 2 * mgY))
    #   border background
    f.write('  <rect  id="outer" class="border" width="%d" height="%d" />\n' \
              % (width + 2 * mgX, height + 2 * mgY))
    #   flip Y axis because it goes downwards in screen coordinate system
    f.write('  <g transform="translate(%d, %d) scale(1, -1)">\n' % (mgX - left, mgY + bottom))
    #   border line
    f.write('    <rect id="inner" class="border" x="%d" y="%d" width="%d" height="%d" />\n\n' \
              % (left, top, width, height))
    #   spans are lines
    for s in spans:
        f.write('    <line id="%s" x1="%d" y1="%d" x2="%d" y2="%d" />\n' \
                  % (s['name'], s['origin']['x'], s['origin']['y'], s['dest']['x'], s['dest']['y']))
    f.write('\n')
    #   nodes are circles
    for node in nodes:
        f.write('    <circle id="%s" cx="%d" cy="%d" r="%d" />\n' \
                  % (node['name'], node['x'], node['y'], circleRadius))
    pass # for n in nodes
    f.write('\n')
    if withTexts:
        #   span texts - the transforms are to flip texts back after the above Y-axis flip
        for s in spans:
            x = s['origin']['x'] + (s['dest']['x'] - s['origin']['x']) / 2 if s['origin']['x'] < s['dest']['x'] \
                  else s['dest']['x'] + (s['origin']['x'] - s['dest']['x']) / 2
            y = s['origin']['y'] + (s['dest']['y'] - s['origin']['y']) / 2 if s['origin']['y'] < s['dest']['y'] \
                  else s['dest']['y'] + (s['origin']['y'] - s['dest']['y']) / 2
            f.write('    <g transform="translate(0, %d) scale(1, -1)">\n' %  (2 * y))
            f.write('      <rect id="%s" class= "spans" x="%d" y="%d" width="%d" height="%d" />\n' \
                      % ('%s-txt-rect' % s['name'], x, y, fontSize, fontSize))
            f.write('      <text id="%s" x="%d" y="%d">%s</text>\n' \
                      % ('%s-txt' % s['name'], x, y, s['name']))
            f.write('    </g>\n')
        pass # for s in spans
        f.write('\n')
        #   node text - they go on top of span texts if overlapped
        for n in nodes:
            f.write('    <text id="%s" x="%d" y="%d" transform="translate(0, %d) scale(1, -1)">%s</text>\n' \
                      % ('%s-text' % n['name'], n['x'], n['y'] + 2, 2 * n['y'], n['name']))
        pass # for n in nodes
    pass # if withTexts

    # This script makes some decorations, to move each text to the center of its node/span
    f.write('''
    </g>\n
    <style>
      text          {  font-size: %dpx;  }
      line, circle  {  stroke: %s; stroke-width: %d;  }
      circle, rect  {  fill: %s;  }
      rect.border   {  stroke: %s; stroke-width: 1; stroke-dasharray: 5 5; display: none;  }
    </style>
    <script><![CDATA[
      var texts = document.getElementsByTagName('text');
      var spans = document.getElementsByClassName('spans');
      for (var i = 0; i < texts.length; i++) {
        var text = texts[i];
        var bbox = text.getBBox();
        text.setAttribute('x', parseInt(text.getAttribute('x')) - Math.floor(bbox.width / 2));
        text.setAttribute('y', parseInt(text.getAttribute('y')) + Math.floor(bbox.height / 4));
        if (i < spans.length) {
          var span = spans[i];
          span.setAttribute('x', parseInt(text.getAttribute('x')));
          span.setAttribute('y', parseInt(text.getAttribute('y')) - (Math.floor(bbox.height * 2 / 3) + 2));
          span.setAttribute('width', bbox.width);
          span.setAttribute('height', bbox.height);
        } // if (i < spans.length)
      } // for (var i = 0; i < texts.length; i++)
    ]]></script>''' % (fontSize, strokeColor, strokeWidth, fillColor, strokeColor))
    f.write('\n')
    f.write('</svg>\n')
    f.close()
pass # def drawGraphSVG(graph, svgFile, **params)


if __name__ == '__main__':
    # Get all the topology files in this foler
    files = [f for f in os.listdir('.')
                if f.endswith('.top') and os.path.isfile(f)]

    for i, f in enumerate(files):
        print i+1, len(files), f
        f = f.split('.')[0]

        # Get topology
        print '    Reading the topology ... ',
        g = nxgFromTopFile(f + '.top')
        print 'done. Graph size: %dn - %ds' % (len(g.nodes), len(g.edges()))

        # Draw SVG
        print '    Drawing ... ',
        drawGraphSVG(g, f + '.svg', params={ 'withTexts':True })
        print 'done.'
    pass # for i, f in enumerate(os.listdir('.'))

pass # if __name__ == '__main__'
