import { Place, PlaceAutocompleteRequest, PlaceDetailsRequest, PlaceDetailsResponse, PlacesNearbyRequest, PlacesNearbyResponse } from "@googlemaps/google-maps-services-js";
import { GoogleMapClient } from "../ExternalServiceClients/GoogleMapClient";
import { Get_AutoComplete_Predictions_Model, Get_Best_Locations_Request_Model } from "../Models/API_Requests/API_Request_Models";
import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { CommonErrorCode, CommonSuccessCode } from "../Models/Common/ErrorCodes";
import { CacheHandler } from "../Utils/Cache_Handler";
import { Get_AutoComplete_Predictions_Response_Model, Get_Best_Locations_Response_Model } from "../Models/API_Responses/API_Response_Models";
import { placeDetails } from "@googlemaps/google-maps-services-js/dist/places/details";
import { placesNearby } from "@googlemaps/google-maps-services-js/dist/places/placesnearby";

interface AutoCompleteResult
{
    description: string,
    place_id: string
}

export class LocationsController
{
    async Get_AutoComplete_Predictions(req :Request, res: Response, next: NextFunction)
    {
        const request_type = "Get_AutoComplete"
        try{
            let autoComplete_req = req.body as Get_AutoComplete_Predictions_Model
            //Cache same requests to not waste API calls to Google Maps
            let final_results:AutoCompleteResult[] = []
            let isCachedData = false
            const cache_check_result = await CacheHandler.Check_Request_Cache(request_type, autoComplete_req.input)
            
            if (cache_check_result.cachedData == null)
            {
                // console.warn(`New autocomplete search entry: ${autoComplete_req.input}`)
                let maps_client = GoogleMapClient.Instance().Client()
                const args= {
                    params: {
                        input: autoComplete_req.input,
                        key: GoogleMapClient.Instance().private_key
                    }
                } as PlaceAutocompleteRequest 
                let predictions_result = await maps_client.placeAutocomplete(args)
                final_results = predictions_result.data.predictions.map(prediction => ({description:prediction.description, place_id:prediction.place_id}))
                await CacheHandler.Set_Request_Cache(request_type, autoComplete_req.input, final_results as any)
            }else
            {
                isCachedData = true
                // console.log(`Cached autocomplete search entry: ${autoComplete_req.input}`)
                final_results = cache_check_result.cachedData as Array<AutoCompleteResult>
            }
            
            
            
            const response: Get_AutoComplete_Predictions_Response_Model = {
                message: "Request success!",
                isFromCachedResults: isCachedData.toString(),
                results: final_results,
                code: CommonSuccessCode.APIRequestSuccess 
            }
            res.send(response)
            next()
        }catch(e:any){
            res.send({
                message: e.message,
                code: CommonErrorCode.GoogleMapsApiFailed
            })
            next()
        }
    }
    
    //Receive an array of place_id(s), returns a PlacesNearbyResponse object
    async Get_Best_Locations_By_Multiple_Addresses(req :Request, res: Response, next: NextFunction)
    {
        try{
            const location_utils = new LocationsUtility()
            const req_model = req.body.request as Get_Best_Locations_Request_Model
            // console.log("?????")
            // console.log(req_model)
            // console.log(req_model.place_ids)
            const center_latlng = await location_utils.Get_Center_LatLng_By_PlaceIds(req_model.place_ids)
            if (center_latlng == undefined)
            {
                throw {
                    message: "Failed to get center LatLng",
                    code: CommonErrorCode.GoogleMapsApiFailed
                }
            }
            const placesNearby_data = await location_utils.Get_Nearby_Places_By_LatLng(center_latlng)
            if (placesNearby_data == null)
            {
                throw {
                    message: "Failed to get nearby places",
                    code: CommonErrorCode.GoogleMapsApiFailed
                }
            }
            
            console.log(placesNearby_data)
            
            const response: Get_Best_Locations_Response_Model = {
                message: "Request success!",
                code: CommonSuccessCode.APIRequestSuccess,
                result:  placesNearby_data
            }
            
            res.send(response)
            next()
            
        }catch(e:any){
            res.send({
                message: e.message,
                code: e.code? e.code : CommonErrorCode.GoogleMapsApiFailed
            })
            next()
        }
    }
}

//For functions that do not directly handle requests
class LocationsUtility
{
    //given a list of place_id(s), then return the "average" center location of all provided places (LatLngLiteral)
    async Get_Center_LatLng_By_PlaceIds(place_ids: string[])
    {
        if(place_ids.length == 0)
        {
            throw Error("LocationsUtility.Get_Center_LatLng_By_PlaceIds() cannot receive an empty array bro")
        }
        /*
        The Correct Way:
        Loop through each place_id, use (Google Maps Client).placeDetails() to get the geocode (LatLngLitertal)
        Get all the geocodes, then use math to find the LatLngLiteral of the middle point (with lowest average distance to every other points?). idk yet..
        Use (Google Maps Client).placesNearby() with the new middle point -> We will have the locations returned by google -> Thats what we need 
        NOTE: placesNearby also support options (locations types, ratings, etc..)
        NOTE: this gonna use the GoogleMaps API call (n+1) times (with n count of place_id) ..might be pricey here
        */
        
        /*
        The Cheating Way: (I'm doing this because its more simple and will cost less money for Maps api calls..)
        I'll just pick a random place_id from provided list, use (Google Maps Client).placeDetails() to get the geocode (LatLngLiteral)
        Use (Google Maps Client).placesNearby() with the randomly picked place's geocode -> We will have the locations returned by google -> Thats what we need 
        NOTE: placesNearby also support options (locations types, ratings, etc..)
        NOTE: this gonna use the GoogleMaps API call 2 times.. much cheaper option here
        */
        const random_index = Math.floor(Math.random() * place_ids.length);
        const randomly_picked_place_id = place_ids[random_index]
        const placeDetals_data = await this.Get_Place_Details_By_PlaceId(randomly_picked_place_id)
        if (placeDetals_data == null)
        {
            throw Error("Get_Place_Details_By_PlaceId failed..")
        }
        return placeDetals_data.geometry?.location
    }
    
    async Get_Place_Details_By_PlaceId(place_id: string): Promise<Place| null>
    {
        const request_type = "Get_Place_Details_By_PlaceId"
        
        try{
            
            const cache_check_result = await CacheHandler.Check_Request_Cache(request_type, place_id)
            if (cache_check_result.cachedData == null)
            {
                console.log('1')
                let maps_client = GoogleMapClient.Instance().Client()
                console.log('2')
                const args = {
                    params: {
                        place_id: place_id,
                        key: GoogleMapClient.Instance().private_key
                    }
                } as PlaceDetailsRequest 
                console.log(place_id)
                let placeDetails_result = await maps_client.placeDetails(args)//TODO: Handle error pls
                const result_final = placeDetails_result.data.result
                
                await CacheHandler.Set_Request_Cache(request_type, place_id, result_final)
                return result_final
            }else
            {
                return cache_check_result.cachedData as Place 
            }
        }catch(e)
        {
            return null
        }
    }
    
    async Get_Nearby_Places_By_LatLng(latlng:{lat:number, lng:number})
    {
        const request_type = "Get_Nearby_Places_By_LatLng"
        const cache_entry_format = `lat:${latlng.lat}-lng:${latlng.lng}`
        try{
            const cache_check_result = await CacheHandler.Check_Request_Cache(request_type, cache_entry_format)
            if (cache_check_result.cachedData == null)
            {
                console.log("1")
                let maps_client = GoogleMapClient.Instance().Client()
                const args = {
                    params: {
                        key: GoogleMapClient.Instance().private_key,
                        radius:10000,
                        type:"cafe",
                        location: {lat:latlng.lat, lng: latlng.lng}
                    }
                } as PlacesNearbyRequest 
                console.log("2")
                let placesNearby_result = await maps_client.placesNearby(args)//TODO: Handle error pls
                console.log("3")
                const result_final = placesNearby_result.data.results
                console.log("4")
                console.log(result_final)
                await CacheHandler.Set_Request_Cache(request_type, cache_entry_format, result_final)
                return result_final 
            }else
            {
                return cache_check_result.cachedData as Place[]
            }
        }catch(e)
        {
            console.warn(`Get_Nearby_Places_By_LatLng failed - message: ${e?? "Unknown"}`)
            return null
        }
    }
}
