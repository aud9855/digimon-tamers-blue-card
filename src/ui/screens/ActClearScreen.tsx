import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function ActClearScreen() {
  return (
    <Screen title="막 클리어">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
