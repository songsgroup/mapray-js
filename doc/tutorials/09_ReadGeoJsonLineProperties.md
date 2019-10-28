## GeoJSONプロパティの参照（線データ）
線のGeoJSONデータを読み込み、そのデータが持つプロパティを参照して対象データ表示する方法を説明します。

### サンプルコード
線のGeoJSONデータを読み込み、そのデータが持つプロパティを参照して対象データ表示する**ReadGeoJsonLineProperties.html**及び、**ReadGeoJsonLineProperties.js**のサンプルコードです。
シーンファイル（**shinjuku_barrier_free_line.json**）は、[Ｇ空間情報センター](https://www.geospatial.jp/ckan/dataset/0401/resource/2c8311ed-d54d-44bf-8c2e-a74d02bbb65d)から取得した実データのため、詳細説明は割愛します。
このサンプルコードでは、新宿駅周辺のバリアフリー化された道路の道路幅に応じて、線の色をグラデーション表示します。


#### ReadGeoJsonLineProperties.html
```HTML
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>ReadGeoJsonLinePropertiesSample</title>
        <script src="https://resource.mapray.com/mapray-js/v0.7.0/mapray.js"></script>
        <script src="ReadGeoJsonLineProperties.js" charset="utf-8"></script>
        <style>
            html, body {
                height: 100%;
                margin: 0;
                background-color: #E0E0E0;
            }

            div#mapray-container {
                display: flex;
                height: 96%;
            }

            div#mapInfo{
                display: flex;
                width: 50px;
                height: 16px;
                margin-left: auto;
                margin-right: 10px;
                align-items: center;
            }

            div#geoJsonInfo{
                display: flex;
                width: 575px;
                height: 16px;
                margin-left: auto;
                margin-right: 10px;
                align-items: center;
            }
        </style>
    </head>

    <body onload="new ReadGeoJsonLineProperties('mapray-container');">
        <div id="mapray-container"></div>
        <div id="mapInfo"><a href="https://maps.gsi.go.jp/development/ichiran.html" style="font-size: 9px">国土地理院</a></div>
        <div id="geoJsonInfo"><a href="https://www.geospatial.jp/ckan/dataset/0401/resource/2c8311ed-d54d-44bf-8c2e-a74d02bbb65d" style="font-size: 9px">（東京都）新宿駅周辺（2018年3月版仕様適用）リンクデータ by 国土交通省　政策統括官: Creative Commons - Attribution</a></div>
    </body>
</html>
```

#### ReadGeoJsonLineProperties.js
```JavaScript
class ReadGeoJsonLineProperties extends mapray.RenderCallback {
    constructor(container) {
        super();

        // Access Tokenを設定
        var accessToken = "<your access token here>";

        // Viewerを作成する
        new mapray.Viewer(container, {
            render_callback: this,
            image_provider: this.createImageProvider(),
            dem_provider: new mapray.CloudDemProvider(accessToken)
        });

        this.SetCamera();

        this.AddText();

        this.LoadGeoJson();
    }

    // 画像プロバイダを生成
    createImageProvider() {
        return new mapray.StandardImageProvider("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/", ".jpg", 256, 2, 18);
    }

    // カメラ位置の設定
    SetCamera() {
        // 球面座標系（経度、緯度、高度）で視点を設定。座標は新宿駅付近
        var home_pos = { longitude: 139.69685, latitude: 35.689777, height: 100.0 };

        // 球面座標から地心直交座標へ変換
        var home_view_to_gocs = mapray.GeoMath.iscs_to_gocs_matrix(home_pos, mapray.GeoMath.createMatrix());

        // 視線方向を定義
        var cam_pos = mapray.GeoMath.createVector3([0, 0, 5000]);
        var cam_end_pos = mapray.GeoMath.createVector3([0, 0, 0]);
        var cam_up = mapray.GeoMath.createVector3([0, 1, 0]);

        // ビュー変換行列を作成
        var view_to_home = mapray.GeoMath.createMatrix();
        mapray.GeoMath.lookat_matrix(cam_pos, cam_end_pos, cam_up, view_to_home);

        // カメラの位置と視線方向からカメラの姿勢を変更
        var view_to_gocs = this.viewer.camera.view_to_gocs;
        mapray.GeoMath.mul_AA(home_view_to_gocs, view_to_home, view_to_gocs);

        // カメラのnear  farの設定
        this.viewer.camera.near = 30;
        this.viewer.camera.far = 500000;
    }

    // テキストの表示
    AddText() {
        // 文字のエンティティを作成
        var font_Entity = new mapray.TextEntity(this.viewer.scene);

        // 新宿駅付近
        var Font_Point = new mapray.GeoPoint(139.699985, 35.690777, 100);

        font_Entity.addText("Shinjuku", Font_Point, { color: [0, 0, 0], font_size: 50 });

        // エンティティをシーンに追加
        this.viewer.scene.addEntity(font_Entity);
    }

    // GeoJSONの読み込み
    LoadGeoJson() {
        var loader = new mapray.GeoJSONLoader( this._viewer.scene, "./data/shinjuku_barrier_free_line.json", {
            onLoad: (loader, isSuccess) => { console.log("success load geojson") },
            getLineWidth: () => 5,
            getLineColor: d => d.properties ? this.GetLineColor(d.properties) : [1.0, 1.0, 1.0, 1.0],
            getExtrudedMode: () => true,
            getElevation: () => 50
        } );

        loader.load();
    }

    // プロパティから線の色を決定し返す
    GetLineColor( properties={} ) {
        var RGBArray = [1.0, 1.0, 1.0, 1.0];

        // 道路の幅から色を決定する
        if ( properties.width ) {
            var width = properties.width;

            if ( width <= 1 ) {
                RGBArray = [1.0, 0.0, 0.0, 1.0];
            }
            else if ( width <= 2 ) {
                RGBArray = [1.0, 0.3, 0.0, 1.0];
            }
            else if ( width <= 3 ) {
                RGBArray = [1.0, 0.6, 0.0, 1.0];
            }
            else {
                RGBArray = [1.0, 1.0, 0.0, 1.0];
            }
        }

        return RGBArray;
    }

}
```

### htmlのサンプルコードの詳細
htmlのサンプルコードの詳細を以下で解説します。

#### htmlの文字コード設定
4行目でhtmlの文字コードを設定します。このサンプルコードでは、utf-8を設定します。

```HTML
<meta charset="UTF-8">
```

#### タイトルの設定
5行目でタイトルを設定します。このサンプルコードでは、ReadGeoJsonLinePropertiesSampleを設定します。

```HTML
<title>ReadGeoJsonLinePropertiesSample</title>
```

#### JavaScriptファイルのパス設定
6～7行目で参照するJavaScripのパスを設定します。このサンプルコードでは、maprayのJavaScriptファイルと線のプロパティを参照して対象データ表示するJavaScriptファイル（**ReadGeoJsonLineProperties.js**）を設定します。

```HTML
<script src="https://resource.mapray.com/mapray-js/v0.7.0/mapray.js"></script>
<script src="ReadGeoJsonLineProperties.js" charset="utf-8"></script>
```

#### スタイルの設定
8～36行目で表示する要素のスタイルを設定します。このサンプルコードでは、下記のスタイルを設定します。
- html
- body
- div#mapray-container（地図表示部分）
- div#mapInfo（出典表示部分）
- div#geoJsonInfo（GeonJSONデータ出典表示部分）

```HTML
<style>
    html, body {
        height: 100%;
        margin: 0;
        background-color: #E0E0E0;
    }

    div#mapray-container {
        display: flex;
        height: 96%;
    }

    div#mapInfo{
        display: flex;
        width: 50px;
        height: 16px;
        margin-left: auto;
        margin-right: 10px;
        align-items: center;
    }

    div#geoJsonInfo{
        display: flex;
        width: 575px;
        height: 16px;
        margin-left: auto;
        margin-right: 10px;
        align-items: center;
    }
</style>
```

#### loadイベントの処理
画面を表示するときに、線のプロパティを参照して対象データ表示するクラスを生成します。そのため、40行目で、ページの読み込み時に、地図表示部分のブロックのidから線のプロパティを参照して対象データ表示するクラスのインスタンスを生成します。
線のプロパティを参照して対象データ表示するクラスはJavaScriptのサンプルコードの詳細で説明します。

```HTML
<body onload="new ReadGeoJsonLineProperties('mapray-container');">
```

#### 地図表示部分と出典表示部分の指定
41行目で地図表示部分になるブロックを記述し、42行目で出典を明記するためのブロックを記述します。
詳細はヘルプページ『**緯度経度によるカメラ位置の指定**』を参照してください。

```HTML
<div id="mapray-container"></div>
<div id="mapInfo"><a href="https://maps.gsi.go.jp/development/ichiran.html" style="font-size: 9px">国土地理院</a></div>
```

#### GeoJSONデータの出典表示部分の設定
43行目で、GeoJSONデータの出典を明記するためのブロックを記述します。

```HTML
<div id="geoJsonInfo"><a href="https://www.geospatial.jp/ckan/dataset/0401/resource/2c8311ed-d54d-44bf-8c2e-a74d02bbb65d" style="font-size: 9px">（東京都）新宿駅周辺（2018年3月版仕様適用）リンクデータ by 国土交通省　政策統括官: Creative Commons - Attribution</a></div>
```

### JavaScriptのサンプルコードの詳細
JavaScriptのサンプルコードの詳細を以下で解説します。

#### クラスの説明
1～106行目で、線のGeoJSONデータを読み込み、そのデータが持つプロパティを参照して対象データ表示するクラスを定義します。クラス内の各メソッドの詳細は以降で解説します。
線のプロパティを参照して対象データ表示するクラスは、mapray.RenderCallbackクラスを継承します。

```JavaScript
class ReadGeoJsonLineProperties extends mapray.RenderCallback {

  //中略

}
```

#### コンストラクタ
2～20行目が線のGeoJSONデータを読み込み、そのデータが持つプロパティを参照して対象データ表示するクラスのコンストラクタです。引数として渡されるブロックのidに対して、mapray.Viewerを作成し、カメラの位置・向きの設定メソッドを呼び出します。その後、文字の表示メソッドとGeoJSONデータのロードメソッドを呼び出します。viewerを作成する際の画像プロバイダは画像プロバイダの生成メソッドから取得します。
mapray.Viewerの作成の詳細は、ヘルプページ『**緯度経度によるカメラ位置の指定**』を参照してください。

```JavaScript
constructor(container) {
    super();

    // Access Tokenを設定
    var accessToken = "<your access token here>";

    // Viewerを作成する
    new mapray.Viewer(container, {
        render_callback: this,
        image_provider: this.createImageProvider(),
        dem_provider: new mapray.CloudDemProvider(accessToken)
    });

    this.SetCamera();

    this.AddText();

    this.LoadGeoJson();
}
```

#### 画像プロバイダの生成
23～25行目が画像プロバイダの生成メソッドです。生成した画像プロバイダを返します。
画像プロバイダの生成の詳細は、ヘルプページ『**緯度経度によるカメラ位置の指定**』を参照してください。

```JavaScript
// 画像プロバイダを生成
createImageProvider() {
    return new mapray.StandardImageProvider("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/", ".jpg", 256, 2, 18);
}
```

#### カメラの位置・向きの設定
28～51行目がカメラの位置・向きの設定メソッドです。
カメラの位置・向きの設定は、ヘルプページ『**緯度経度によるカメラ位置の指定**』を参照してください。

```JavaScript
// カメラ位置の設定
SetCamera() {
    // 球面座標系（経度、緯度、高度）で視点を設定。座標は新宿駅付近
    var home_pos = { longitude: 139.69685, latitude: 35.689777, height: 100.0 };

    // 球面座標から地心直交座標へ変換
    var home_view_to_gocs = mapray.GeoMath.iscs_to_gocs_matrix(home_pos, mapray.GeoMath.createMatrix());

    // 視線方向を定義
    var cam_pos = mapray.GeoMath.createVector3([0, 0, 5000]);
    var cam_end_pos = mapray.GeoMath.createVector3([0, 0, 0]);
    var cam_up = mapray.GeoMath.createVector3([0, 1, 0]);

    // ビュー変換行列を作成
    var view_to_home = mapray.GeoMath.createMatrix();
    mapray.GeoMath.lookat_matrix(cam_pos, cam_end_pos, cam_up, view_to_home);

    // カメラの位置と視線方向からカメラの姿勢を変更
    var view_to_gocs = this.viewer.camera.view_to_gocs;
    mapray.GeoMath.mul_AA(home_view_to_gocs, view_to_home, view_to_gocs);

    // カメラのnear  farの設定
    this.viewer.camera.near = 30;
    this.viewer.camera.far = 500000;
}
```

#### 文字の表示
54～65行目で、地名を表現する文字をmapray.Viewerのシーンに追加します。
文字の表示方法の詳細は、ヘルプページ『**文字の表示（addTextを使った表示）**』を参照してください。

```JavaScript
// テキストの表示
AddText() {
    // 文字のエンティティを作成
    var font_Entity = new mapray.TextEntity(this.viewer.scene);

    // 新宿駅付近
    var Font_Point = new mapray.GeoPoint(139.699985, 35.690777, 100);

    font_Entity.addText("Shinjuku", Font_Point, { color: [0, 0, 0], font_size: 50 });

    // エンティティをシーンに追加
    this.viewer.scene.addEntity(font_Entity);
}
```

#### シーンのロード
68～78行目がシーンのロードメソッドです。mapray.GeoJSONLoaderでシーンを読み込みます。
GeoJSONLoaderクラス生成時の引数には、GeoJSONファイルのエンティティを追加するシーン、読み込むGeoJSONファイルのURL、オプション集合の順に指定します。このサンプルコードでは、viewerクラスのシーン、GeoJSONファイルのURL、オプション集合の順に指定します。オプション集合には、シーンのロードが終了した時のコールバック関数、線の幅、線の色、指定高度優先可否、指定高度をの順に指定します。このサンプルコードでは、GeoJSONデータのプロパティに応じた内容にするため、線の色には、プロパティの値に応じた色が取得できるメソッドを設定しています。なお、プロパティの値に応じた色が取得できるメソッドの詳細は後述します。
また、読み込むGeoJSONファイルのURLは、httpもしくはhttpsでアクセスできるURLを指定します。
最後に、77行目のload関数を呼び出すことでシーンの読み込みができます。
なお、GeoJSONLoaderクラスは、GeoJSONデータのfeatureごとのロード時にコールバック関数が呼ばれ、GeoJSONデータの任意のproperty属性にアクセスすることができます。また、propertyに書かれているkeyの値をコールバック関数内で取得することも可能です。

```JavaScript
// GeoJSONの読み込み
LoadGeoJson() {
    var loader = new mapray.GeoJSONLoader( this._viewer.scene, "./data/shinjuku_barrier_free_line.json", {
        onLoad: (loader, isSuccess) => { console.log("success load geojson") },
        getLineWidth: () => 5,
        getLineColor: d => d.properties ? this.GetLineColor(d.properties) : [1.0, 1.0, 1.0, 1.0],
        getExtrudedMode: () => true,
        getElevation: () => 50
    } );

    loader.load();
}
```

#### プロパティの値に応じた色の変更
81～103行目がプロパティの値に応じた色が取得できるメソッドです。読み込んだGeoJSONデータのプロパティを参照して、適切な色を返します。
このサンプルコードでは、道路の幅が広くなるにつれて、赤色から黄色になるように設定しています。

```JavaScript
// プロパティから線の色を決定し返す
GetLineColor( properties={} ) {
    var RGBArray = [1.0, 1.0, 1.0, 1.0];

    // 道路の幅から色を決定する
    if ( properties.width ) {
        var width = properties.width;

        if ( width <= 1 ) {
            RGBArray = [1.0, 0.0, 0.0, 1.0];
        }
        else if ( width <= 2 ) {
            RGBArray = [1.0, 0.3, 0.0, 1.0];
        }
        else if ( width <= 3 ) {
            RGBArray = [1.0, 0.6, 0.0, 1.0];
        }
        else {
            RGBArray = [1.0, 1.0, 0.0, 1.0];
        }
    }

    return RGBArray;
}
```

### 出力イメージ
このサンプルコードの出力イメージは下図のようになります。
![出力イメージ](image/ReadGeoJsonLineProperties.png)