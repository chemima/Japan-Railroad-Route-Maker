# [Japan Railroad Route Maker](https://route-jp.netlify.app/)

Go to [https://route-jp.netlify.app/](https://route-jp.netlify.app/).

## Data

Source data is quite huge and not included on this repository. You should download source data by yourself and place them under src/data directory.

* https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N05-2024.html

`src/data` directory tree should look like this:

```
src/
    data/
        N05-24_RailroadSection2.dbf
        N05-24_RailroadSection2.geojson
        N05-24_RailroadSection2.prj
        N05-24_RailroadSection2.shp
        N05-24_RailroadSection2.shx
        N05-24_Station2.dbf
        N05-24_Station2.geojson
        N05-24_Station2.prj
        N05-24_Station2.shp
        N05-24_Station2.shx
```

After running `npm install` and `scripts/build-data.js` scripts, `dist/data` directory will contain coverted smaller data.

For more information, please refer to the website.

* http://nlftp.mlit.go.jp/ksj/

*All rights reserved. Copyright (c) 1974-2026 National Land Information Division, National Spatial Planning and Regional Policy Bureau, MLIT of Japan.*

## Acknowledgments

This project is based on [Japan Railroad Plotter](https://github.com/Snack-X/japan-railroad-plotter.git) by [@Snack-X](https://github.com/Snack-X).

## License

This project is licensed under the MIT License.
(Original code by @Snack-X is licensed under the MIT License.)
