import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function RestScreen() {
  return (
    <Screen title="휴식">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
