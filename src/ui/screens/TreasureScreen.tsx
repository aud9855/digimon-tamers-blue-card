import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function TreasureScreen() {
  return (
    <Screen title="보물">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
