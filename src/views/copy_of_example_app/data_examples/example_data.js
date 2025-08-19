/* 
 Author: Ranjan Mannige (github.com/ranjanmannige)

 This is a javascript implementation of the Louvain
 community detection algorithm (http://arxiv.org/abs/0803.0476)
 Based on https://bitbucket.org/taynaud/python-louvain/overview

 Code style is very imperative, I know :)
 */

// CNU: CURRENTLY NOT USED, but which would be useful to use in a full-stack app (e.g., for governance)
data = {
annotated_text:[
	// first passage
	{
		"id": 1,
		// --------------------------------------------------------------------------------
		// c:COLLECTIONs indicate a cohesive collection of documents
		"cId":1, // The collection's ID
		// CNU
		"cName":"NER examples", 
		//CNU:
		"cBaseFn": "@/assets/something.txt", // Link or path to the collection (e.g., a PDF, when it comes to books)
		// --------------------------------------------------------------------------------
		// d:DOCUMENTs indicate a cohesive collection of passages
		"dId":1,  // The document's ID
		//CNU:
		"dName": "NER example 1", // CURRENTLY NOT USED; In some cases, document and collection are the same
		//CNU:
		"dGroups": ["allowed group 1"], // group IDs that are allowed to access this document
		//CNU:
		"dUsers": ["allowed user 1",],  // user IDs that are allowed to access this document
		// --------------------------------------------------------------------------------
		// p:PASSAGEs: Passages are atomic & meaningful sub-components of a document 
		// (e.g., a paragraph, or a chapter, depending on the use case). 
		"pId":1, // The unique id of the passage. Proposed to be docId_ + paragraph number
		// pRaw: A link or actual content of the raw text:
		"pRaw":"Apple is looking at buying U.K. startup for $1 billion",
		// pClean: A link or actual content of the cleaned text (derived from pRaw and used for NLP) 
		"pClean": "Apple is looking at buying U.K. startup for $1 billion", 
		// pHTML: A link or actual content of the HTML-formatted text
		"pHTML": "<b>Apple</b> is looking at buying U.K. startup for $1 billion", 
		// pdfPage: The page number at which this passage shows up in the PDF (Null for non PDF documents)
		"pdfPage": 12,
		// ---------------------------------------------------------------------------------
		// DISPLAY OPTIONS
		// a toggle that determines whether this passage will be shown in the front end	(e.g., for filtering)
		"pShow": 1, 
		// Passage relationships that will be ingested into a knowledge graph
		"pRels": [['Apple','looking_at_buying','U.K. startup']], 
		// Passage topics, e.g. 
		"pTerms": [
			{"term":"Apple"     ,"topic":"ORG"    ,"method":"ner",start:0 ,stop:5},
			{"term":"U.K."      ,"topic":"COUNTRY","method":"ner",start:27,stop:31},
			{"term":"$1 billion","topic":"MONEY"  ,"method":"ner",start:44,stop:54}
		],
		// CNU:
		"modifiedDate":null,
		"title":"This is a title",
		"displayText":"pHTML",
		// Levels of detail to show, index 0 being the greatest level of detail
		"displayTextShow":[
			"Apple is looking at buying U.K. startup for $1 billion",
			"Apple is looking at buying U.K. startup for $1 billion",
			"Apple is looking at buying U.K. startup for $1 billion"
		],
		"zoom":0
	},
	// second passage
	{
		"id": 1,
		// --------------------------------------------------------------------------------
		// c:COLLECTIONs indicate a cohesive collection of documents
		"cId":1, // The collection's ID
		// CNU
		"cName":"NER examples", 
		//CNU:
		"cBaseFn": "@/assets/something.txt", // Link or path to the collection (e.g., a PDF, when it comes to books)
		// --------------------------------------------------------------------------------
		// d:DOCUMENTs indicate a cohesive collection of passages
		"dId":1,  // The document's ID
		//CNU:
		"dName": "NER example 1", // CURRENTLY NOT USED; In some cases, document and collection are the same
		//CNU:
		"dGroups": ["allowed group 1"], // group IDs that are allowed to access this document
		//CNU:
		"dUsers": ["allowed user 1",],  // user IDs that are allowed to access this document
		// --------------------------------------------------------------------------------
		// p:PASSAGEs: Passages are atomic & meaningful sub-components of a document 
		// (e.g., a paragraph, or a chapter, depending on the use case). 
		"pId":1, // The unique id of the passage. Proposed to be docId_ + paragraph number
		// pRaw: A link or actual content of the raw text:
		"pRaw":"Apple is a tech company that was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.",
		// pClean: A link or actual content of the cleaned text (derived from pRaw and used for NLP) 
		"pClean": "Apple is a tech company that was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.", 
		// pHTML: A link or actual content of the HTML-formatted text
		"pHTML": "<a href='https://en.wikipedia.org/wiki/Apple_Inc.'>Apple</a> is a tech company that was founded by <a href='https://en.wikipedia.org/wiki/Steve_Jobs'>Steve Jobs</a>, <a href='https://en.wikipedia.org/wiki/Steve_Wozniak'>Steve Wozniak</a>, and <a href='https://en.wikipedia.org/wiki/Ronald_Wayne'>Ronald Wayne</a>", 
		// pdfPage: The page number at which this passage shows up in the PDF (Null for non PDF documents)
		"pdfPage": 12,
		// ---------------------------------------------------------------------------------
		// DISPLAY OPTIONS
		// a toggle that determines whether this passage will be shown in the front end	(e.g., for filtering)
		"pShow": 1, 
		// Passage relationships that will be ingested into a knowledge graph
		"pRels": [
			['Apple','is','tech company'],
			['Apple','was_founded_by','Steve Jobs'],
			['Apple','was_founded_by','Steve Wozniak'],
			['Apple','was_founded_by','Ronald Wayne']
		], 
		// Passage topics, e.g. 
		"pTerms": [
			{"term":"Apple"        ,"topic":"ORG"   ,"method":"ner",start:0 ,stop:5},
			{"term":"Steve Jobs"   ,"topic":"PERSON","method":"ner",start:44,stop:54},
			{"term":"Steve Wozniak","topic":"PERSON","method":"ner",start:56,stop:69},
			{"term":"Ronald Wayne" ,"topic":"PERSON","method":"ner",start:75,stop:87}
		],
		// CNU:
		"modifiedDate":null,
		"title":"This is a title",
		"displayText":"pHTML",
		// Levels of detail to show, index 0 being the greatest level of detail
		"displayTextShow":[
			"Apple is a tech company that was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.",
			"Apple is a tech company that was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.",
			"Apple is a tech company that was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne."
		],
		"zoom":0
	},
]
}