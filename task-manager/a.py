s = "LVIII"
num = 0
convert = {'I':1, 'V':5, 'X':10, 'L':50, 'C':100, 'D':500, 'M':1000}
print(len(s)-1)
for i in range(len(s)-1):

    if convert[s[i+1]]>convert[s[i]]:
        num -= convert[s[i]]
        print(convert[s[i+1]])
        print(convert[s[i]])
        print('-')
        
    else:
        num += convert[s[i]]

num += convert[s[-1]]
print(num)
