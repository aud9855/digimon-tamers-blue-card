import { ActionList } from '../components/ActionList';
import { Placeholder, Screen } from '../components/Screen';

export function ShopScreen() {
  return (
    <Screen title="상점">
      <Placeholder>
        <ActionList />
      </Placeholder>
    </Screen>
  );
}
