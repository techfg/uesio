function starter(bot) {
	const appInfo = bot.getApp()
	const appName = appInfo.getName()
	const appDescription = appInfo.getDescription()

	const modelID = "anthropic.claude-3-haiku-20240307-v1:0"

	let headerLogoFile = "uesio/sitekit.yourlogo"
	let headerLogoFilePath = ""
	let footerLogoFile = "uesio/sitekit.yourlogo"
	let footerLogoFilePath = "yourlogo_dark.png"

	let backgroundPaths = [
		"files/orangesplash.jpg",
		"files/paintsplash.jpg",
		"files/pinksplash1.jpg",
		"files/pinksplash2.jpg",
	]

	const min = 0
	const max = backgroundPaths.length
	const random = Math.floor(Math.random() * (max - min) + min)

	let backgroundFile = "uesio/sitekit.backgrounds"
	let backgroundFilePath = backgroundPaths[random]

	let tagline = "Hello World."
	let tagline_sub = "Generate websites quickly and easily with SiteKit."
	let testimonials = [
		{
			quote: "By far the best thing since sliced bagels.",
			name: "Barbara Mills",
			title: "CTO Acme Widget Co.",
		},
	]
	let pages = [
		{
			name: "Product",
			type: "INFO",
			description: "",
		},
		{
			name: "About",
			type: "INFO",
			description: "",
		},
		{
			name: "Contact",
			type: "CALL_TO_ACTION",
			description: "",
		},
	]
	let footerCategories = [
		{
			name: "Company",
			links: [
				{
					name: "Contact",
					relative_url: "/contact",
				},
				{
					name: "Services",
					relative_url: "/services",
				},
			],
		},
		{
			name: "Legal",
			links: [
				{
					name: "Privacy Policy",
					relative_url: "/privacy-policy",
				},
				{
					name: "Terms of Service",
					relative_url: "/terms-of-service",
				},
			],
		},
		{
			name: "Resources",
			links: [
				{
					name: "Book Appointment",
					relative_url: "/book-appointment",
				},
				{
					name: "Testimonials",
					relative_url: "/testimonials",
				},
				{
					name: "FAQs",
					relative_url: "/faqs",
				},
			],
		},
	]

	const doContentAndCopy = bot.params.get("use_ai_for_content_and_copy")
	if (doContentAndCopy && doContentAndCopy !== "false") {
		const systemPrompt = `
			You are an assistant who specializes in creating professional marketing websites.
			You deeply understand marketing best practices and are a creative copywriter. You
			seek to complete the task in the simplest and most straightforward way possible.
		`

		const prompt = `
			Use the tool provided to create a website for a company called "${appName}". The
			desciption of the website is "${appDescription}". Create at least 4 pages for the website.
		`

		const pageTypes = [
			"INFO",
			"PERSONA",
			"PRICING",
			"CALL_TO_ACTION",
			"DATA_COLLECTION_FORM",
		]

		const createWebsiteTool = {
			name: "create_website",
			description: "Create a website",
			input_schema: {
				type: "object",
				properties: {
					pages: {
						type: "array",
						description:
							"The pages to create. There is already a home page, so you don't need to create that page.",
						items: {
							type: "object",
							properties: {
								name: {
									type: "string",
									description: "The page name",
								},
								type: {
									type: "string",
									description: `
										The type of website page.
										Only use a type from the list below.
										${pageTypes.join("\n")}
									`,
								},
								description: {
									type: "string",
									description: `
										A detailed description of this page of the website. This should describe
										which sections and content it will have. As well as the purpose of the page.
									`,
								},
							},
							required: ["name", "type", "description"],
						},
					},
					footer_links_category: {
						type: "array",
						description:
							"A heading in the footer for links to less-used parts of the site. Create at least 3 categories.",
						items: {
							type: "object",
							properties: {
								name: {
									type: "string",
									description:
										"The name of the link category.",
								},
								links: {
									type: "array",
									description:
										"The footer links for this category",
									items: {
										type: "object",
										properties: {
											name: {
												type: "string",
												description:
													"The name of the link",
											},
											relative_url: {
												type: "string",
												description: "The relative url",
											},
										},
										required: ["name", "relative_url"],
									},
								},
							},
						},
					},
					testimonials: {
						type: "array",
						description:
							"The testimonials of satisfied users of this company. Create 4 testimonials.",
						items: {
							type: "object",
							properties: {
								quote: {
									type: "string",
									description: `
										The positive and funny quote from the person giving the testimonial.
									`,
								},
								name: {
									type: "string",
									description: `
										The name of the person giving the testimonial.
									`,
								},
								title: {
									type: "string",
									description: `
										The job title of the person giving the testimonial.
									`,
								},
							},
							required: ["quote", "name", "title"],
						},
					},
					logo_prompt: {
						type: "string",
						description:
							"a prompt for a text-to-image ai model for generating a compelling and professional logo for this company.",
					},
					tagline: {
						type: "string",
						description:
							"A catchy marketing tagline for this website. It should be between 3 and 10 words.",
					},
					tagline_secondary_text: {
						type: "string",
						description:
							"The secondary text for the main tagline. This should be related to the tagline and be clever and engaging. It should be between 6 and 14 words.",
					},
					key_features: {
						type: "array",
						description:
							"Key features or communication points that this website should make. Provide 3 key benefits or talking points for the subject of this website.",
						items: {
							type: "object",
							properties: {
								title: {
									type: "string",
									description: `
										The title or short description of the key feature.
									`,
								},
								description: {
									type: "string",
									description: `
										The longer description or explanation of the key feature.
									`,
								},
							},
							required: ["title", "description"],
						},
					},
				},
				required: ["pages", "logo_prompt"],
			},
		}

		const result = bot.runIntegrationAction(
			"uesio/aikit.bedrock",
			"invokemodel",
			{
				model: modelID,
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
				system: systemPrompt,
				tools: [createWebsiteTool],
				tool_choice: {
					type: "tool",
					name: createWebsiteTool.name,
				},
			}
		)

		if (!result.length) {
			throw new Error("Invalid Result")
		}

		const input = result[0].input

		tagline = input.tagline
		tagline_sub = input.tagline_secondary_text
		testimonials = input.testimonials
		pages = input.pages
		footerCategories = input.footer_links_category

		bot.log.info("result", input)
		/*
		bot.runGenerators([
			{
				namespace: "uesio/sitekit",
				name: "image",
				params: {
					prompt: `A (minimal:0.5), (artistic:0.6), (wordmark:1) for the app named (${appName}:1). The background is white and the workmark is full frame, edge-to-edge, borderless, full bleed.`,
					filename: "logo",
					aspect_ratio: "21:9",
				},
			},
			{
				namespace: "uesio/sitekit",
				name: "image",
				params: {
					prompt: `Seamless tile, (minimal:0.9), (artistic:0.5) (wallpaper:1) background for the app named (${appName}:1). Simple, small, illustrations. The background is white. The primary color is (orange:0.4).`,
					filename: "background",
					aspect_ratio: "1:1",
				},
			},
		])
			*/
	}

	bot.runGenerators([
		{
			// Create a viewlayout variant
			namespace: "uesio/sitekit",
			name: "variant_viewlayout_page",
			params: {
				backgroundFile,
				backgroundFilePath,
			},
		},
		{
			// Create a header view
			namespace: "uesio/sitekit",
			name: "view_header",
			params: {
				logoFile: headerLogoFile,
				logoFilePath: headerLogoFilePath,
				pages,
			},
		},
		{
			// Create a footer view
			namespace: "uesio/sitekit",
			name: "view_footer",
			params: {
				logoFile: footerLogoFile,
				logoFilePath: footerLogoFilePath,
				categories: footerCategories,
			},
		},
		{
			// Create a home view/route
			namespace: "uesio/sitekit",
			name: "view_home",
			params: {
				tagline,
				tagline_sub,
				testimonials,
			},
		},
		{
			// Create public profile/permission set
			namespace: "uesio/sitekit",
			name: "profile_public",
			params: {},
		},
		{
			// Set up the bundledef and other dependencies
			namespace: "uesio/sitekit",
			name: "starter_bundledef",
			params: {},
		},
	])
}
