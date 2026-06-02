---
title: asynchronous error handling in expressjs
date: 2024-10-23
dateUpdated: 2024-10-23
layout: post.njk
tags: ['promises', 'error handling', 'express', 'nodejs']
excerpt: 'handling async errors in express without crashing your server'
img: ''
imgAlt: ''
order: 50
---

It seems like support for async/await in ExpressJS has been a long time in the works - see [this github thread which has been going since 2014](https://github.com/expressjs/express/issues/2259)! Express 5.0 apparently does include this support, but the stable/default version (something like 4.2.x at the time I created this post) still does not.

## setup

Let's say we have a little server like this...

```js
import express from 'express'
import fs from 'fs/promises'

const app = express()
app.use(express.json())

app.listen(3000, () => {
	console.log('Server is running on http://localhost:3000')
})
```

Here are 2 basic routes which both attempt to read a file asynchronously. I've created a `file.txt` in the same directory, so the `/hello` route will succeed, but the `/oops` route will not.

```ts
import fs from 'fs/promises'
//...
app.get('/hello', async (req, res) => {
	const content = await fs.readFile('file.txt', 'utf-8')
	res.json({ success: true, message: content })
})

app.get('/oops', async (req, res) => {
	const content = await fs.readFile('non-existing-file.txt', 'utf-8')
	res.json({ success: true, message: content })
})
```

When I visit localhost:3000/hello, I see the file contents in the response and everything works great. BUT when I hit the `/oops` endpoint...literally no response (Postman shows 'error: socket hang up'). And most critically, _the server crashes entirely_. I can't hit the good endpoint anymore, no one can, everything's down. If I'd written this _synchronously_, I would've gotten an error in response. We haven't defined any error handling, so it'd be kind of ugly, but the server would continue running and it wouldn't just blow up everything. Unfortunately, express doesn't know how to handle errors in asynchronous functions, so we have to figure out some ways around that.

## try/catch

One way to manage this is by using try/catch in each router function:

```js
app.get('/oops', async (req, res) => {
	try {
		const content = await fs.readFile('non-existing-file.txt', 'utf-8')
		res.json({ success: true, message: content })
	} catch (err) {
		res.status(500).json({ success: false, message: 'something is wrong!' })
	}
})
```

This works, but I have to handle errors in every route individually, which is not ideal. I want the responses coming from my server to be consistent. In this case I want them always to have a shape with a boolean `success` key and a `message`. If I have a bunch of routes, and come back to my code in a couple months and add a new one, I might have forgotten all about that shape I created and write something totally different.

## try/catch blocks + error handler

I'm going to define my own error handler to maintain this consistent response shape. Then I'll update my route to use the `next` function in the event of an error:

```typescript
import { type ErrorRequestHandler } from 'express'
//...

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	res.status(500).json({ success: false, message: err.message })
}

app.get('/oops', async (req, res, next) => {
	try {
		const content = await fs.readFile('non-existing-file.txt', 'utf-8')
		res.json({ success: true, message: content })
	} catch (err) {
		next(err)
	}
})

app.use(errorHandler) // note that this line needs to be *after* your route definitions
```

The `next` function here does the work of passing any errors along to the error handler. This time when we visit localhost:3000/oops, nothing crashes, and we get this more helpful response:

```json
{
	"success": false,
	"message": "ENOENT: no such file or directory, open 'non-existing-file.txt'"
}
```

## reusable async wrapper + error handler

The above is better, but I don't love the idea of writing try/catch blocks over & over in my code... it feels repetitive and cluttered.

To avoid that, we write a function that will wrap our asynchronous code. Basically we're just extracting this try/catch + next logic into a handy reusable function:

```typescript
import express, { RequestHandler, Request, Response, NextFunction } from 'express'

const asyncWrapper = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
	return Promise.resolve(fn(req, res, next)).catch(next)
}

app.get(
	'/oops',
	asyncWrapper(async (req, res) => {
		const content = await fs.readFile('non-existing-file.txt', 'utf-8')
		res.json({ success: true, message: content })
	}),
)
```

This works exactly the same as the try/catch example above, but is much cleaner, especially if we have lots of routes!

## other resources

There are a few packages floating around which do basically a similar thing as the async wrapper above, but by patching into Express' code itself so you don't have to worry about using the wrapper every time. The most popular one seems to be [express-async-errors](https://www.npmjs.com/package/express-async-errors). It doesn't seem to be actively maintained any longer, though, so I haven't actually tried it.
