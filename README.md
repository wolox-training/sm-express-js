[![Build Status](https://travis-ci.org/wolox-training/sm-express-js.svg?branch=master)](https://travis-ci.org/wolox-training/sm-express-js)

# Wolox Training

This is a training project. It will include two modules, one for "Maquetado" and other for "NodeJS"

## ExpressJs

This project is in the root, the only directory that doesn't belong to the project is "training-maquetado".
It was created with Wolox's template.

## Maquetado

This project uses "sass" to create the styles and gulp/npm to compile them.
This project was created with npm 6.1.0

### Make it run!

First, you need to access "training-maquetado" directory. There you need to execute

```
$ npm install
```

This will install the dependencies. Once it's done, you need to compile the CSS for the first time. For this you can run the command

```
$ npm run sass
``` 

Or if you plan to develop, you can use

```
$ npm run sass-watch
``` 

And it will compile with any change in the CSS

