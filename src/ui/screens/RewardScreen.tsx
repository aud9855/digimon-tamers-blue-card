import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function RewardScreen() {
  return (
    <Screen title="카드 고르기">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
