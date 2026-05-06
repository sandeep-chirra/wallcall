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
}
