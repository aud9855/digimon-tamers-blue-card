import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function BattleScreen() {
  return (
    <Screen title="전투">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
