import Foundation
import React
import WidgetKit

@objc(WallCalWidgetBridge)
class WallCalWidgetBridge: NSObject {
  private let appGroupID = "group.org.reactjs.native.example.WallCalNative.shared"
  private let eventsKey = "wallcal_widget_events"

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(saveEvents:resolver:rejecter:)
  func saveEvents(
    _ payload: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let defaults = UserDefaults(suiteName: appGroupID) else {
      reject("app_group_unavailable", "Unable to open shared App Group defaults.", nil)
      return
    }

    defaults.set(payload, forKey: eventsKey)
    WidgetCenter.shared.reloadAllTimelines()
    resolve(nil)
  }

  @objc(reloadTimelines:rejecter:)
  func reloadTimelines(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    WidgetCenter.shared.reloadAllTimelines()
    resolve(nil)
  }

  @objc(saveWallpaperImage:eventId:resolver:rejecter:)
  func saveWallpaperImage(
    _ tempUri: String,
    eventId: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let sourceURL: URL

    if tempUri.hasPrefix("file://"), let parsedURL = URL(string: tempUri) {
      sourceURL = parsedURL
    } else {
      sourceURL = URL(fileURLWithPath: tempUri)
    }

    guard
      let imageData = try? Data(contentsOf: sourceURL),
      let containerURL = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)
    else {
      reject("ERROR", "Could not read wallpaper image", nil)
      return
    }

    let destURL = containerURL.appendingPathComponent("wallcal_wallpaper.jpg")
    do {
      try imageData.write(to: destURL)
      UserDefaults(suiteName: appGroupID)?.set(eventId, forKey: "wallcal_wallpaper_event_id")
      WidgetCenter.shared.reloadAllTimelines()
      resolve("saved")
    } catch {
      reject("ERROR", error.localizedDescription, nil)
    }
  }
}
