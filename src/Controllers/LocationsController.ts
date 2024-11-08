import { PlaceAutocompleteRequest } from "@googlemaps/google-maps-services-js";
import { GoogleMapClient } from "../ExternalServiceClients/GoogleMapClient";
import { Get_AutoComplete_Predictions_Model } from "../Models/API_Requests/API_Request_Models";
import express, { Express, Request, Response , Application, NextFunction } from 'express';
import { CommonErrorCode, CommonSuccessCode } from "../Models/Common/ErrorCodes";

export class LocationsController
{
    async Get_AutoComplete_Predictions(req :Request, res: Response, next: NextFunction)
    {
        try{
            let maps_client = GoogleMapClient.Instance().Client()
            let autoComplete_req = req.body as Get_AutoComplete_Predictions_Model
            const args= {
                params: {
                    input: autoComplete_req.input,
                    key: GoogleMapClient.Instance().private_key
                }
            } as PlaceAutocompleteRequest 
            let predictions_result = await maps_client.placeAutocomplete(args)
            console.log(predictions_result.data.predictions.map(prediction => prediction.description))
            let final_results = predictions_result.data.predictions.map(prediction => prediction.description)
            
            res.send({
                message: "Request success!",
                isFromCachedResults: "false",
                results: final_results,
                code: CommonSuccessCode.APIRequestSuccess 
            })
        }catch(e:any){
            res.send({
                message: e.message,
                code: CommonErrorCode.GoogleMapsApiFailed
            })
        }
    }
}