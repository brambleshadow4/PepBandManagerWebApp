from templateSystem import *


Out(
	"views/members/members.html", 
	Fill(Template("views/members/members.template.html"), Bind("nav", Template("components/navigation.template.html")))
)

Out(
	"views/events/events.html", 
	Fill(Template("views/events/events.template.html"), Bind("nav", Template("components/navigation.template.html")))
)

Out(
	"views/points/points.html", 
	Fill(Template("views/points/points.template.html"), Bind("nav", Template("components/navigation.template.html")))
)