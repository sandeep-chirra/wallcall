export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Preview: undefined;
  Widget: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  EventList: undefined;
  AddEvent: {editId?: string} | undefined;
  Returns: undefined;
  EventPreview: {eventId: string};
};
