import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function MapScreen() {
  return (
    <Screen title="지도">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
