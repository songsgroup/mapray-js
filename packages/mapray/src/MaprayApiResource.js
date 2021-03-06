import HTTP from "./HTTP";
import Dom from "./util/Dom";
import Resource, { ResourceType } from "./Resource";



/**
 * Mapray Cloudに登録されたデータにおいて、URLアクセスを要するリソースを表現する。
 * <dl>
 * <dt> index.htmlのように基準となるファイルを指定し、そのファイルからの相対パスでサブリソースへアクセスする。
 * <dd>
 *    コンストラクタで基準となるファイルを指定し、load()はこのファイルを読み込む。
 *    loadSubResource( sub_url )は、sub_urlが相対パスの場合は基準となるファイルからの相対パスとして解釈される。
 * <dt> ルートパスを指定し配下のリソースへアクセスする。
 * <dd>
 *    コンストラクタで基準となるURLを指定する。この時、URLは必ず/で終了する必要があり、load()は動作が定義されない。
 *    loadSubResource( sub_url )は、sub_urlが相対パスの場合は基準となるURLからの相対パスとして解釈される。
 * </dl>
 */
class ApiUrlResource extends Resource {

    /**
     * @param {MaprayApi} api
     * @param {string} url
     */
    constructor( api, url ) {
        const index = url.lastIndexOf( "/" );
        if ( index === -1 ) throw new Error( "invalid url" );
        //super( api, url.substr( 0, index + 1 ) );
        super();
        this._api = api;
        this._url = url;
        this._base_url = url.substr( 0, index + 1 )
    }

    /**
     * @param {object} options
     */
    load( options={} ) {
        if ( options.type === ResourceType.JSON ) {
            return (
                this._api.fetch( HTTP.METHOD.GET, this._url )
                .then( response => response.json() )
            );
        }
        else {
            return this._api.fetch( HTTP.METHOD.GET, this._url );
        }
    }

    /**
     * @protected
     */
    loadSubResourceSupported() {
        return true;
    }

    /**
     * @summary リソースにアクセスする。sub_urlは相対・絶対の両方に対応。
     * @param {string} sub_url
     * @return {Resource}
     */
    loadSubResource( sub_url, options={} ) {
        const url = Dom.resolveUrl( this._base_url, sub_url );
        // const url = this._base_url + sub_url;
        if ( options.type === ResourceType.BINARY ) {
            return (
                this._api.fetch( HTTP.METHOD.GET, url )
                .then(response => {
                        return response.arrayBuffer();
                })
            );
        }
        else if ( options.type === ResourceType.IMAGE ) {
            return (
                this._api.fetch( HTTP.METHOD.GET, url )
                .then( response => {
                        if ( !response.ok ) throw new Error( response.statusText );
                        return response.blob();
                } )
                .then( Dom.loadImage )
            );
        }
        else {
            return this._api.fetch( HTTP.METHOD.GET, url );
        }
    }
}



/**
 * Mapray Cloudに登録されたDatasetを表現するリソース。
 */
export class DatasetResource extends Resource {
    constructor( api, datasetId ) {
        super();
        this._api = api;
        this._datasetId = datasetId;
    }

    /**
     * @return {Promise(object)} データ(geojson)
     */
    load() {
        return this._api.listFeatures( this._datasetId );
    }
}



/**
 * Mapray Cloudに登録された3DDatasetのモデルを表現するリソース。
 */
export class Dataset3DSceneResource extends Resource {

    /**
     * @param {MaprayApi} api
     * @param {string|string[]} datasetIds データセットのid。複数指定する場合は配列を指定する。
     */
    constructor( api, datasetIds ) {
        super();
        this._api = api;
        this._datasetIds = Array.isArray( datasetIds ) ? datasetIds : [ datasetIds ];
    }

    /**
     * @return {Promise(object)} シーンファイル(json)
     */
    load() {
        return this._api.get3DDatasetScene( this._datasetIds );
    }

    /**
     * @protected
     */
    resolveResourceSupported() {
      return true;
    }

    /**
     * @summary シーンファイルに含まれるモデル及びモデルに関連づけられたリソースへアクセス際に利用されるResource。
     * @param {string} sub_url モデルURL
     * @return {Resource} 
     */
    resolveResource( sub_url ) {
        return new ApiUrlResource( this._api, sub_url );
    }
}



/**
 * Mapray Cloudに登録されたPoint Cloud Datasetを表現するリソース。
 */
export class PointCloudDatasetResource extends Resource {

    /**
     * @param {MaprayApi} api
     * @param {string} datasetId データセットのid
     */
    constructor( api, datasetId ) {
        super();
        this._api = api;
        this._datasetId = datasetId;
    }

    /**
     * @return {Promise<object>} 点群定義(json)
     */
    load() {
        return this._api.getPointCloudDataset( this._datasetId );
    }

    /**
     * @protected
     */
    resolveResourceSupported() {
      return true;
    }

    /**
     * @param {string} sub_url 点群が公開されているURLへアクセスするためのResource。
     * @return {Resource} 点群ファイルリソース
     */
    resolveResource( sub_url ) {
        return new ApiUrlResource( this._api, sub_url );
    }
}
