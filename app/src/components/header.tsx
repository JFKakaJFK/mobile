import { Switch } from "@mantine/core";
import { FiChevronLeft } from "react-icons/fi";
import { MobileState, useMobile } from "../lib/use-mobile";

function Header() {
  const { connected, loading, disconnect, state, toggleState } = useMobile();
  return (
    <div className="w-full grid grid-cols-[64px_1fr_64px] items-center p-4">
      <button disabled={loading} onClick={disconnect}>
        <FiChevronLeft size={32} />
      </button>
      <div className="text-center flex flex-col items-center">
        <h1 className="text-xl font-bold">Mobile</h1>
        {connected && (
          <div className="w-min scale-[.8] -mt-1 transform-gpu px-2 p-1 rounded-full text-xs uppercase text-green-700 bg-green-200">
            connected
          </div>
        )}
      </div>
      <Switch
        disabled={loading}
        checked={state === MobileState.ON}
        onChange={toggleState}
        size="lg"
        onLabel="ON"
        offLabel="OFF"
        classNames={{
          input: "checked:bg-dark-blue bg-baby-blue !border-baby-blue",
        }}
        sx={{
          input: {
            "&:after": {
              color: "#043697",
            },
            "&:checked:after": {
              color: "inherit",
            },
          },
        }}
      />
    </div>
  );
}

export default Header;
