<img src="src/assets/img/icon-128.png" width="64"/>

# Premint+ Chrome Extension

## Features

This is a Chrome Extension for the Premint website to keep track of entered raffles.

- Background refreshing with custom interval settings to check latest status
- Simple Popup with raffle list and current status
- Quick view of registration closure dates, mint dates, mint price, and twitter, discord, and site links
- Ability to automatically add registered raffles to your Premint+ list
- Ability to automatically remove raffles that you lost from your stored list
- Cross browser support if logged into Chrome with a Google account (e.g. same list can be loaded on different machines)

This extension requires you hold a [Hive Alpha or Hive Founders](https://opensea.io/collection/hive-alpha) pass in your wallet. For more information, see [hivealpha](https://twitter.com/hivealpha) on Twitter, or [check the website](https://hivealpha.io/).

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Run `npm start` or `npm run build`
5. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
6. Profit.

## Webpack auto-reload and HRM

This extension uses the [webpack server](https://webpack.github.io/docs/webpack-dev-server.html) for development (started with `npm start`) with auto reload feature that reloads the browser automatically every time that you save some file in your editor.

You can run the dev mode on other port if you want. Just specify the env var `port` like this:

```
$ PORT=6002 npm run start
```

## Content Scripts

Although this extension uses the webpack dev server, it's also prepared to write all your bundles files on the disk at every code change, so you can point, on your extension manifest, to your bundles that you want to use as [content scripts](https://developer.chrome.com/extensions/content_scripts), but you need to exclude these entry points from hot reloading [(why?)](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate/issues/4#issuecomment-261788690). To do so you need to expose which entry points are content scripts on the `webpack.config.js` using the `chromeExtensionBoilerplate -> notHotReload` config.

## Packing

After development, you can run the command:

```
$ NODE_ENV=production npm run build
```

Now, the content of `build` folder will be production ready.

## Resources:

- [Hive Alpha Discord](https://discord.gg/hivealpha)
- [Webpack documentation](https://webpack.js.org/concepts/)
- [Chrome Extension documentation](https://developer.chrome.com/extensions/getstarted)

---

Enjoyed this? Feel free to send me some gas money to fuel my degen habits 🍻
0x04b313104d4582bc025F59144188232826D18E44
