# Lancer Movement Tutorial Script

CAPTION "In Lancer SPEED determines how far you can go" 3s
show a circle token with label "mech" on the origin
CAPTION "This mech has speed 2"
show pulse on all coordinates in distance 2 from the origin
CAPTION "The mech will now move by 2"
now move the mech token two hexes away
clear the highlights
CAPTION "It is out of move now..."
CAPTION "...but it can spend a quick action to move again"
move again two fields somewhere else
CAPTION "this is called a boost"
CAPTION "Terrain can make it harder to move"
highlight some hexes next to the mech in yellow, point arrow at them with label "difficult terrain"
CAPTION "Moving through difficult terrain costs 2x speed"
clear the arrows
make the mech move into one of the difficult terrain hexes
CAPTION "With Speed 2 this mech can move through only 1 difficult terrain"
clear the highlights
CAPTION "Dangerous terrain does not slow you down ..."
CAPTION "But may cause damage"
highlight some hexes near the mech in red, point at them with label dangerous terrain
move the mech into one of the dangerous hexes
CAPTION "When you move into dangerous terrain for the first time"
CAPTION "You must roll ENGINEERING, you get 5 damage if you fail"
CAPTION "The damage type depends on the terrain itself (up to GM)"