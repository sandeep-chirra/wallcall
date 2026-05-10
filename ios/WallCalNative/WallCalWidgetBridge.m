#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WallCalWidgetBridge, NSObject)

RCT_EXTERN_METHOD(saveEvents:(NSString *)payload
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reloadTimelines:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(saveWallpaperImage:(NSString *)tempUri
                  eventId:(NSString *)eventId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
