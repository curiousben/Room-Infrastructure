--[[

  Desc:
    This method is used to find a specific element in a list and return a 1 or 0 depending on if the the element exists in the list
  Args:
    Key:
      (1) List (String): The List that is being sifted through.
      (2) Element (String): The element being looked for.
  Returns:
    0 (Int): If the the address doesn't exist in the List
    1 (Int): If the the address exists in the List
    nil (Null): If the 'LLEN' or 'LINDEX' returns a nil if the List doesn't exist or the index that is being looked at doesn't exist in the list.

--]]
local length = redis.call("LLEN", KEYS[0]) - 1
if length == nil then
  return nil
else
  for i=length,0,-1 do
    local address = redis.call("LINDEX", KEYS[0], i)
    if address == nil then
      return nil
    end
    if address == ARGV[0] then
      return 1
    end
  end
  return 0
end
