from templateSystem import *

t1 = Bind("nav", Template("components/navigation.template.html"))

Out(
	"views/members/members.html", 
	Fill(Template("views/members/members.template.html"), t1)
)

Out(
	"views/events/events.html", 
	Fill(Template("views/events/events.template.html"), t1)
)

Out(
	"views/points/points.html", 
	Fill(Template("views/points/points.template.html"), t1)
)

searchBox = Template("components/memberSearchBox.template.html")

Out(
	"views/plan/plan.html", 
	Fill(
		Fill(Template("views/plan/plan.template.html"), t1),
		Bind("searchBox", Fill(searchBox, Bind("id", "e1")))
	)
)