import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function EventScreen() {
  return (
    <Screen title="이벤트">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
