import { PlaceAutocompleteRequest } from "@googlemaps/google-maps-services-js";
import { GoogleMapClient } from "../ExternalServiceClients/GoogleMapClient";
import { Get_AutoComplete_Predictions_Model } from "../Models/API_Requests/API_Request_Models";
import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { CommonErrorCode, CommonSuccessCode } from "../Models/Common/ErrorCodes";
import { CacheHandler } from "../Utils/Cache_Handler";
import { Get_AutoComplete_Predictions_Response_Model } from "../Models/API_Responses/API_Response_Models";

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
                console.warn(`New autocomplete search entry: ${autoComplete_req.input}`)
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
                console.log(`Cached autocomplete search entry: ${autoComplete_req.input}`)
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
}