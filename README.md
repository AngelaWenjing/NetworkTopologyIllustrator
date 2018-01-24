Network Topology Illustrator
----------------------------

This tool reads network topology and illustrates it to SVG files automatically.


Installation
------------

This tool requires Python 2 and [`NetworkX`][networkx] as the prerequisite.

```bash
pip install networkx

```

Usage
-----

Prepare your topology files ("`*.top`") into the same folder with
`NetworkTopologyIllustrator.py`, and then simply run the script.

```bash
python NetworkTopologyIllustrator.py
```

The topology files are in the following format:

```
# some_top_file.top
# this line is comment

# nodes first - "NODE", "X" and "Y" are necessary, others are optional
NODE    X       Y
N001    478.00  5.00
N002    376.00  8.00
N003    134.00  9.00
# ... ...

# spans after - "SPAN", "O" and "D" are necessary, others are optional
SPAN    O       D       LENGTH      MTTF(h)     MTTR(h) UA
S001    N001    N002    102.0441    28634.6763  12      0.0004
S002    N001    N007    82.3772     35470.9879  12      0.0003
S003    N001    N009    54.4059     53707.4281  12      0.0002
# ... ...
```


[networkx]: https://networkx.github.io/
