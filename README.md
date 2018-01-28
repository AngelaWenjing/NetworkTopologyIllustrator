Network Topology Illustrator
----------------------------

This Google Chrome extension reads network topology and illustrates it to SVG
files automatically.

Installation
------------

Go to [Chrome Web Store][store] to search `Network Topology Illustrator`, or
simply to to [this page][nti].

Usage
-----

1. Prepare your network topology and paste it into the text area. It's a piece
   of text in the following format:

   ```text
   # some_top_file.top
   # this line is comment

   # nodes first
   NODE    X       Y
   N001    478.00  5.00
   N002    376.00  8.00
   N003    134.00  9.00
   # ... ...

   # edges after
   EDGE    O       D
   E001    N001    N002
   E002    N001    N007
   E003    N001    N009
   # ... ...
   ```

2. Tweak the parameters besides the text area. `Text size` refers to the size of
   the node/edge (e.g., `N001`, `E001`, etc.) names to be drawn. If it equals to
   `0`, then the names won't be drawn at all.

3. The right side table will list the topology information, once the topology
   text is finished.

4. Press "Save", the topology will be drawn into a download SVG file, where the
   name is formated as `XnYe.svg` with `X` equals to the number of nodes and `Y`
   equals to the number of edges.

Previous version
----------------

The [previous Python version][nti_py] is deprecated and will no longer be
maintained.

[store]: https://chrome.google.com/webstore/category/extensions
[nti]: https://chrome.google.com/webstore/detail/network-topology-illustra/cjkdplfcgohjlmbefbgpelkmjincljbj
[nti_py]: https://github.com/AngelaWenjing/NetworkTopologyIllustrator/AlreadyDeprecated
