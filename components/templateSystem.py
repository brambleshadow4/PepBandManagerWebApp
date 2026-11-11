import io
import re

def Vars(filename):
	f = open(filename, "r")
	pat1 = re.compile(r"^@(\w+) (.*)$")
	pat2 = re.compile(r"^@(\w+)$")
	varss = {}
	multiLine = False
	multiLineTag=""
	multiLineData=""

	for line in f:
		if multiLine:
			print(line)
			print(len(line))
			print(line == ".\r")
			print(line == ".")

			if line[0] == "." and line.strip() == ".":
				multiLine = False
				varss[multiLineTag] = multiLineData
			else:
				multiLineData += line
		else:
			match = pat1.match(line)
			if match:
				varss[match.group(1)] = match.group(2).strip()
			else:
				match = pat2.match(line)
				if match:
					multiLine = True
					multiLineTag = match.group(1)
					multiLineData=""

	f.close()

	return varss
	

def Template(filename):
	f = open(filename, "r")
	template = f.read()
	f.close()
	return template


def Fill(template, varss):
	for key in varss:
		template = template.replace("{{" + key + "}}", varss[key])
	return template

def Bind(key, template):
	varss = {}
	varss[key] = template
	return varss


def Out(filename, template):
	f = open(filename, "w")
	f.write(template)
	f.close()