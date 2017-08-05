--[[

  Desc:
    This method is used to find a specific element in a list and return a 1 or 0 depending on if the the element exists in the list
  Input:
    Key:
      (1) List (String): The List that is being sifted through.
    Args:
      (1) Element (String): The element being looked for.
  Returns:
    0 (Int): If Argument one doesn't exist in the List.
    1 (Int): If Argument one exists in the List.
    -1 (Int): If the List that exists at the key has a length of zero.
    nil (Null): If the key that is passed in doesn't exist or is not a List.
--]]
if redis.call("TYPE", KEYS[1])["ok"] ~= 'list' then
  return nil
end
local length = redis.call("LLEN", KEYS[1])
if length == 0 then
  return -1
end
for i=-1,-length,-1 do
  local address = redis.call("LINDEX", KEYS[1], i)
  if address == ARGV[1] then
    return 1
  end
end
return 0
