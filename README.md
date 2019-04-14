# ejs-render-remote

[ejs](https://ejs.co/) remote client side includes.

```js
html = ejs.rr('sayhello.ejs', {name: 'Simon'});
```

## Quick start

0. Install with `npm i ejs-render-remote`
1. Include this script
   ```html
   <script src="node_modules/ejs-render-remote/ejs-render-remote.js"></script>
   ```
2. Create a file with your template, for example `templates/hello-world.ejs` containing `hello <%= name %>!`
3. Render the remote template:
   ```js
   someDomelement.outerHTML = ejs.rr('templates/hello-world.ejs', {name: 'Simon'});
   ```

## Examples

See `examples` folder.

## api

### ejs.rr(templateUrl, data)

`ejs.rr` (render remote) renders the remote template. It makes an ajax call to fetch the template and then `ejs.render`s it.  
The resulting ejs template function is cached, so the second time this function is invoked for that same template, `ejs.rr` returns the rendered template synchronously.

### ejs.preloadTemplate(templateUrl)

Since `ejs.rr` is async, you can call `ejs.preloadTemplate` before invoking `ejs.rr` to warm the template cache up for that `templateUrl`.  
By doing so the call to `ejs.rr` will return the rendered template string right away.
