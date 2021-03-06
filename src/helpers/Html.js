import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom/server'
import serialize from 'serialize-javascript'
import Helmet from 'react-helmet'

const debug = require('debug')('redux-universal:helpers:Html')

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  };

  render() {
    debug('Start render Html')

    const { assets, component, store } = this.props

    let content
    try {
      content = component ? ReactDOM.renderToString(component) : ''
      debug(content)
    } catch (err) {
      debug(err.stack)
    }

    const head = Helmet.rewind()

    const result = (
      <html lang="en-us">
        <head>
          {head.base.toComponent()}
          {head.title.toComponent()}
          {head.meta.toComponent()}
          {head.link.toComponent()}
          {head.script.toComponent()}

          <link rel="shortcut icon" href="/favicon.ico"/>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
          <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet"/>
          <link href="//cdn.jsdelivr.net/flexboxgrid/6.3.0/flexboxgrid.min.css" rel="stylesheet"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}

          {/* (will be present only in development mode) */}
          {/* outputs a <style/> tag with all bootstrap styles + App.scss + it could be CurrentPage.scss. */}
          {/* can smoothen the initial style flash (flicker) on page load in development mode. */}
          {/* ideally one could also include here the style for the current page (Home.scss, About.scss, etc) */}
        </head>
        <body>
          <div id="content" dangerouslySetInnerHTML={{ __html: content }}/>
          <script dangerouslySetInnerHTML={{ __html: `window.__data=${serialize(store.getState())}` }} charSet="UTF-8"/>
          <script src="/dist/vendor.bundle.js" charSet="UTF-8"/>
          <script src={assets.javascript.main} charSet="UTF-8"/>
        </body>
      </html>
    )

    debug('Successfully render Html')
    return result
  }
}
